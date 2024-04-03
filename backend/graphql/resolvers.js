const { UserInputError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const uuid = require('uuid')

const { Transaction, User, Tag, Extra, Form, Event, Group, Visit, Email } = require('../db')

const { authorized, isAdmin, eventValidate, userValidate, notCurrentUser, validPassword, extraValidate, createVisitValidate, eventModifiable, eventModifiableAndSlot, formValidate } = require('../utils/validation')
const { calcAvailableTimes, calcFromVisitTimes, slotFromDate } = require('../utils/calculator')
const { sendWelcomes, sendCancellation } = require('../utils/mailer/mailSender')
const { PubSub } = require('graphql-subscriptions')
const { expandEvents, expandGroups, expandVisits, expandVisitTimes } = require('../db/expand')
const logger = require('../logger')
const { subDays, differenceInCalendarDays } = require('date-fns')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    getUsers: isAdmin(() => User.find()),
    getEvent: (root, args) => Event.findById(args.id, expandEvents),
    getEvents: async (root, args, { currentUser }) => {
      if (args.ids) return Event.findByIds(args.ids, expandEvents)
      const rangeDays = currentUser ? 365 * 10 : 90 // 10 years when logged in, 90 days otherwise
      const events = await Event.FindByRange({ end: { after: subDays(new Date(), rangeDays) } }, expandEvents)

      const returnedEvents = currentUser ? events : events
        .filter(e => !e.publishDate || new Date() >= new Date(e.publishDate))
        .map(e => e.group?.disabled ? { ...e, availableTimes: [] } : e)

      return returnedEvents
    },
    getTags: () => Tag.find(),
    getVisits: authorized(() => Visit.find({}, expandVisits)),
    getEmailTemplates: isAdmin(() => Email.find()),
    getGroups: authorized(() => Group.find({}, expandGroups)),
    findVisit: (root, args) => Visit.findById(args.id, expandVisits),
    me: (root, args, context) => context.currentUser,
    getExtras: () => Extra.find(),
    getForms: () => Form.find(),
    getCancelForm: async () => {
      const form = await Form.find({ name: 'cancellation' })
      return form[0]
    },
  },
  Visit: {
    startTime: (data) => new Date(data.startTime).toISOString(),
    endTime: (data) => new Date(data.endTime).toISOString()
  },
  Form: {
    fields: (form) => JSON.stringify(form.fields)
  },
  Event: {
    publishDate: (event) => event.publishDate ? new Date(event.publishDate).toISOString() : null
  },
  Mutation: {
    createGroup: authorized((root, args) => Group.Insert(args)),
    modifyGroup: authorized((root, args) => Group.Update(args.id, args, expandGroups)),
    deleteGroups: authorized(async (root, args) => {
      await Promise.all((await Group.findByIds(args.ids)).reduce((r, g) => r
        .concat(g.events.map(id => Event.update(id, { disabled: true }))), []))
      return Group.remove(args.ids)
    }),
    assignPublishDateToEvents: authorized(async (root, args) => {
      const events = await Event.findByIds(args.events)
      return Promise.all(events.map(e => Event.update(e.id, {
        publishDate: args.publishDate ? new Date(args.publishDate) : undefined
      })))
    }),
    assignEventsToGroup: authorized(async (root, args) => {
      const [session, eventInst, groupInst] = Transaction.construct(Event, Group)
      const events = []
      const _events = (await eventInst.findByIds(args.events))
        .filter(e => !e.group || e.group.toString() !== args.group.toString())
      for (const event of _events) {
        await groupInst.DeltaUpdate(event.group, {
          visitCount: - event.visits.length,
          events: { filter: event.id }
        })
        if (args.group) await groupInst.DeltaUpdate(args.group, {
          visitCount: event.visits.length,
          events: { concat: event.id }
        })
        events.push(eventInst.update(event.id, { group: args.group ? args.group : null }))
      }
      await Promise.all(events)
      await session.commit()
      return events
    }),
    updateEmail: isAdmin(async (root, args) => {
      const email = await Email.findOne({ name: args.name })
      return Email.update(email.id, args)
    }),
    updateUser: isAdmin(async (root, args, { currentUser }) => {
      userValidate(args)
      args.isAdmin !== true && notCurrentUser(currentUser, args.user)
      const passwordHash = args.password && await bcrypt.hash(args.password, config.SALT)
      return User.update(args.user, { ...args, passwordHash })
    }),
    createUser: isAdmin(async (root, args) => {
      userValidate(args)
      const passwordHash = await bcrypt.hash(args.password, config.SALT)
      return User.insert({ ...args, passwordHash })
    }),
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      await validPassword(args.password, user.passwordHash, user.username)
      const userForToken = { username: user.username, id: user.id }
      return { value: jwt.sign(userForToken, config.SECRET, { expiresIn: '12h' }) }
    },
    createEvents: authorized(async (root, args) => {
      eventValidate(args)
      const [session, eventInst, groupInst] = Transaction.construct(Event, Group)

      const group = await groupInst.findById(args.group)
      const tags = await Tag.Insert(args.tags)
      const extras = await Extra.findByIds(args.extras)

      const events = await Promise.all(args.dates.map(date => {
        const [start, end] = slotFromDate(date, args.start, args.end)
        return eventInst.insert({
          ...args,
          start,
          end,
          availableTimes: [{ startTime: start, endTime: end }],
          disabled: false,
          extras,
          tags,
          group: group ? group.id : null
        }, expandEvents)
      }))

      await groupInst.update(group?.id, { events: group?.events?.concat(events.map(e => e.id)) })
      await session.commit()
      pubsub.publish('EVENTS_MODIFIED', { eventsModified: events
        .filter(e => !e.publishDate || new Date() >= e.publishDate) })
      return events
    }),
    disableEvent: authorized(async (root, args) => {
      const event = await Event.update(args.event, { disabled: true, reserved: null })
      pubsub.publish('EVENT_MODIFIED', { eventModified: event })
      return event
    }),
    enableEvent: authorized(async (root, args) => {
      const event = await Event.update(args.event, { disabled: false, reserved: null })
      pubsub.publish('EVENT_MODIFIED', { eventModified: event })
      return event
    }),
    lockEvent: async (root, args) => {
      const event = await Event.findById(args.event)
      eventModifiable(event)

      const token = uuid.v4()
      const danglingEvent = await Event.update(event.id, { reserved: token })
      setTimeout(async () => {
        try { // this is required here because if an error occurs -> app crashes
          const unLocked = await Event.update(event.id, { reserved: null })
          pubsub.publish('EVENT_MODIFIED', { eventModified: unLocked })
        } catch (err) {
          logger.error(err.message)
        }
      }, config.EVENT_LOCK_DURATION, event)

      pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      return {
        event: danglingEvent.id,
        token,
        locked: danglingEvent.reserved ? true : false
      }
    },
    unlockEvent: async (root, args) => {
      const event = await Event.update(args.event, { reserved: null })
      pubsub.publish('EVENT_MODIFIED', { eventModified: event })
      return event
    },
    modifyEvent: authorized(async (root, args) => {
      const event = await Event.findById(args.event, expandVisitTimes)
      const timeSlot = eventModifiableAndSlot(args, event)

      const [session, eventInst, groupInst] = Transaction.construct(Event, Group)

      if (!event.group || event.group.toString() !== args.group?.toString()) {
        await groupInst.DeltaUpdate(event.group, {
          visitCount: - event.visits.length,
          events: { filter: event.id }
        })
        if (args.group) await groupInst.DeltaUpdate(args.group, {
          visitCount: event.visits.length,
          events: { concat: event.id }
        })
      }

      const tags = await Tag.Insert(args.tags)
      const extras = await Extra.findByIds(args.extras)
      const danglingEvent = await eventInst.update(args.event, {
        ...args,
        availableTimes: calcFromVisitTimes(event.visits, {
          startTime: timeSlot.start,
          endTime: timeSlot.end
        }, event.waitingTime, event.duration),
        start: timeSlot.start,
        end: timeSlot.end,
        extras,
        group: args.group ? args.group : null,
        tags
      }, expandEvents)

      await session.commit()
      pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      return danglingEvent
    }),
    createVisit: async (root, args, { currentUser }) => {
      const [session, eventInst, groupInst, visitInst] = Transaction.construct(Event, Group, Visit)
      const event = await eventInst.findById(args.event)

      createVisitValidate(args, event, currentUser)

      const group = await groupInst.DeltaUpdate(event.group, {
        visitCount: 1,
        returnOriginal: true,
        forceUpdate: !!currentUser
      })

      if (group?.disabled && !currentUser) throw new UserInputError('Event is assigned to a disabled group')

      const extras = await Extra.findByIds(args.extras)
      const visit = await visitInst.insert({
        ...args,
        event: event.id,
        status: true,
        extras,
        customFormData: args.customFormData ? JSON.parse(args.customFormData) : null,
        created: new Date()
      }, expandVisits)

      const danglingEvent = await eventInst.update(event.id, {
        availableTimes: calcAvailableTimes(event.availableTimes, {
          startTime: args.startTime,
          endTime: args.endTime
        }, event.waitingTime, event.duration),
        visits: event.visits.concat(visit.id),
        reserved: null
      })

      //await sendWelcomes(visit, danglingEvent)
      logger.info("REMEMBER TO UNCOMMENT ABOVE")
      pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      await session.commit()
      return visit
    },
    modifyVisit: authorized(async (root, args) => {
      const [session, eventInst, groupInst, visitInst] = Transaction.construct(Event, Group, Visit)
      // get visit to be modified
      const visit = await visitInst.findById(args.visit)
      if (!visit || visit.status === false) throw new UserInputError('Visit not found')

      let danglingEvent = null
      let _danglingEvent = null
      if (args.event) {
        // get original event assigned to the visit
        const event = await eventInst.findById(visit.event, expandEvents)

        // group delta update
        await groupInst.DeltaUpdate(event.group, { visitCount: -1, returnOriginal: true, forceUpdate: true })

        // visit times should be released
        const visitTimes = event.visits.filter(v => v.id !== visit.id)
        danglingEvent = await eventInst.update(event.id, {
          visits: event.visits.filter(v => v.id !== visit.id),
          availableTimes: calcFromVisitTimes(visitTimes, {
            startTime: new Date(event.start),
            endTime: new Date(event.end)
          }, event.waitingTime, event.duration)
        })

        // find new event where the visit should be added
        const _event = await eventInst.findById(args.event)

        // group delta update
        await groupInst.DeltaUpdate(_event.group, { visitCount: 1, returnOriginal: true, forceUpdate: true })

        _danglingEvent = await eventInst.update(_event.id, {
          availableTimes: calcAvailableTimes(_event.availableTimes, {
            startTime: args.startTime,
            endTime: args.endTime
          }, _event.waitingTime, _event.duration),
          visits: _event.visits.concat(visit.id),
          reserved: null
        })
      }

      // update visit instance
      const danglingVisit = await visitInst.update(visit.id, {
        ...args,
        customFormData: args.customFormData ? JSON.parse(args.customFormData) : null
      }, expandVisits)

      // commit instances
      await session.commit()

      if (danglingEvent) pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      if (_danglingEvent) pubsub.publish('EVENT_MODIFIED', { eventModified: _danglingEvent })
      return danglingVisit
    }),
    cancelVisit: async (root, args) => {
      const [session, eventInst, groupInst, visitInst] = Transaction.construct(Event, Group, Visit)

      const visit = await visitInst.findById(args.id)
      if (!visit || visit.status === false) throw new UserInputError('Visit not found')

      const today = new Date()
      const visitStartDate = new Date(visit.startTime)
      const daysUntilVisit = differenceInCalendarDays(visitStartDate, today)

      if (daysUntilVisit <= 14) throw new UserInputError('Cancellation not allowed within two weeks of the visit')

      let event = await eventInst.findById(visit.event, expandEvents)

      const group = await groupInst.DeltaUpdate(event.group, { visitCount: -1, returnOriginal: true })
      let danglingEvent
      if (group?.disabled) {
        const tags = await Tag.Insert(event.tags.map(tag => tag.name))
        const extras = await Extra.findByIds(event.extras)
        danglingEvent = await eventInst.insert({
          ...event,
          visits: [],
          group: null,
          disabled: false,
          start: new Date(visit.startTime),
          end: new Date(visit.endTime),
          availableTimes: [{
            startTime: new Date(visit.startTime).toISOString(),
            endTime: new Date(visit.endTime).toISOString()
          }],
          extras,
          tags
        })
      }

      const visitTimes = event.visits.filter(v => v.id !== visit.id)

      event = await eventInst.update(event.id, {
        visits: event.visits.filter(v => v.id !== visit.id),
        availableTimes: calcFromVisitTimes(visitTimes, {
          startTime: new Date(event.start),
          endTime: new Date(event.end)
        }, event.waitingTime, event.duration)
      })
      const danglingVisit = await visitInst.update(visit.id, {
        cancellation: args.cancellation ? JSON.parse(args.cancellation) : null // do not return undefined
      })

      //await sendCancellation(danglingVisit, event)
      logger.info("REMEMBER UNCOMMENT ABOVE")
      await session.commit()
      if (danglingEvent) {
        pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      }
      pubsub.publish('EVENT_MODIFIED', { eventModified: event })
      return danglingVisit
    },
    createExtra: authorized((root, args) => {
      extraValidate(args)
      return Extra.insert(args)
    }),
    modifyExtra: authorized((root, args) => Extra.update(args.id, args)),
    deleteExtras: authorized((root, args) => Extra.remove(args.ids)),
    deleteEvents: authorized((root, args) => {
      const events = Event.remove(args.ids)
      pubsub.publish('EVENTS_DELETED', { eventsDeleted: args.ids })
      return events
    }),
    forceDeleteEvents: isAdmin(async (root, args, { currentUser }) => {
      const user = await User.findOne({ username: currentUser.username })
      await validPassword(args.password, user.passwordHash, user.username)
      const events = await Promise.all((await Event.findByIds(args.events))
        .map(async event => {
          await Visit.remove(event.visits)
          await Group.DeltaUpdate(event.group, {
            visitCount: - event.visits.length,
            events: { filter: event.id }
          })
          await Event.remove(event.id)
          return event
        }))
      pubsub.publish('EVENTS_DELETED', { eventsDeleted: args.events })
      return events
    }),
    deleteUsers: isAdmin((root, args, { currentUser }) => {
      if (args.ids.includes(currentUser.id)) throw new UserInputError('One of the users cannot be removed')
      return User.remove(args.ids)
    }),
    createForm: authorized((root, args) => {
      formValidate(args)
      return Form.insert({ ...args, fields: JSON.parse(args.fields) })
    }),
    updateForm: authorized((root, args) => {
      formValidate(args)
      return Form.update(args.id, { ...args, fields: JSON.parse(args.fields) })
    }),
    deleteForms: authorized((root, args) => Form.remove(args.ids))
  },
  Subscription: {
    eventModified: { subscribe: () => pubsub.asyncIterator(['EVENT_MODIFIED']) },
    eventsModified: { subscribe: () => pubsub.asyncIterator(['EVENTS_MODIFIED']) },
    eventsDeleted: { subscribe: () => pubsub.asyncIterator(['EVENTS_DELETED']) }
  }
}

module.exports = resolvers
