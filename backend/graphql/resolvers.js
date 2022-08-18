const { UserInputError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const uuid = require('uuid')

const { Transaction, User, Tag, Extra, Form, Event, Group, Visit, Email } = require('../db')

const { authorized, isAdmin, eventValidate, userValidate, notCurrentUser, validPassword, extraValidate, createVisitValidate, eventModifiable, eventModifiableAndSlot } = require('../utils/validation')
const { calcAvailableTimes, calcFromVisitTimes, slotFromDate } = require('../utils/calculator')
const { sendWelcomes, sendCancellation } = require('../utils/mailer/mailSender')
const { PubSub } = require('graphql-subscriptions')
const { expandEvents, expandGroups, expandVisits, expandVisitTimes } = require('../db/expand')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    getUsers: isAdmin(async () => await User.find()),
    getEvent: async (root, args) => await Event.findById(args.id, expandEvents),
    getEvents: async (root, args, { currentUser }) => {
      if (args.ids) return await Event.findByIds(args.ids, expandEvents)
      const events = await Event.FindByDays(currentUser?.isAdmin ? 90 : 0, expandEvents)
      return currentUser ? events : events
        .filter(e => !e.publishDate || new Date() >= new Date(e.publishDate))
        .map(e => e.group?.disabled ? { ...e, availableTimes: [] } : e)
    },
    getTags: async () => await Tag.find(),
    getVisits: authorized(async () => await Visit.find({}, expandVisits)),
    getEmailTemplates: isAdmin(async () => await Email.find()),
    getGroups: authorized(async () => await Group.find({}, expandGroups)),
    findVisit: async (root, args) => await Visit.findById(args.id, expandVisits),
    me: (root, args, context) => context.currentUser,
    getExtras: async () => await Extra.find(),
    getForms: async () => await Form.find(),
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
    createGroup: authorized(async (root, args) => await Group.Insert(args)),
    modifyGroup: authorized(async (root, args) => await Group.Update(args.id, args, expandGroups)),
    deleteGroups: authorized(async (root, args) => {
      const groups = await Group.findByIds(args.ids)
      for (let group of groups) {
        for (let id of group.events) {
          await Event.update(id, { disabled: true })
        }
      }
      return Group.remove(args.ids)
    }),
    assignPublishDateToEvents: authorized(async (root, args) => {
      let returnedEvents = []
      const events = await Event.findByIds(args.events)
      for (let event of events) {
        returnedEvents.push(await Event.update(event.id, {
          publishDate: args.publishDate ? new Date(args.publishDate) : undefined
        }))
      }
      return returnedEvents
    }),
    assignEventsToGroup: authorized(async (root, args) => {
      let events = []
      const [session, eventInst, groupInst] = Transaction.construct(Event, Group)
      for (let id of args.events) {
        const event = await eventInst.findById(id)
        if (event && (!event.group || event.group.toString() !== args.group.toString())) {
          await groupInst.DeltaUpdate(event.group, {
            visitCount: - event.visits.length,
            events: { filter: event.id }
          })
          if (args.group) await groupInst.DeltaUpdate(args.group, {
            visitCount: event.visits.length,
            events: { concat: event.id }
          })
          events.push(await eventInst.update(event.id, { group: args.group ? args.group : null }))
        }
      }
      await session.commit()
      return events
    }),
    updateEmail: isAdmin(async (root, args) => {
      const email = await Email.findOne({ name: args.name })
      return await Email.update(email.id, args)
    }),
    updateUser: isAdmin(async (root, args, { currentUser }) => {
      userValidate(args)
      args.isAdmin !== true && notCurrentUser(currentUser, args.user)
      const passwordHash = args.password && await bcrypt.hash(args.password, 10 /* salt */)
      return await User.update(args.user, { ...args, passwordHash })
    }),
    createUser: isAdmin(async (root, args) => {
      userValidate(args)
      const passwordHash = await bcrypt.hash(args.password, 10 /* salt */)
      return await User.insert({ ...args, passwordHash })
    }),
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      await validPassword(args.password, user.passwordHash)
      const userForToken = { username: user.username, id: user.id }
      return { value: jwt.sign(userForToken, config.SECRET, { expiresIn: '12h' }) }
    },
    createEvents: authorized(async (root, args) => {
      eventValidate(args)
      const [session, eventInst, groupInst] = Transaction.construct(Event, Group)

      let group = await groupInst.findById(args.group)
      const tags = await Tag.Insert(args.tags)
      const extras = await Extra.findByIds(args.extras)

      const events = []

      for (let date of args.dates) {
        const [start, end] = slotFromDate(date, args.start, args.end)
        const event = await eventInst.insert({
          ...args,
          start,
          end,
          availableTimes: [{ startTime: start, endTime: end }],
          disabled: false,
          extras,
          tags,
          group: group ? group.id : null
        }, expandEvents)

        group = await groupInst.update(group?.id, { events: group?.events?.concat(event.id) })
        events.push(event)
      }
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
          console.log('\x1b[31m%s\x1b[0m', 'ERROR:', err.message)
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

      if (!event.group || event.group.toString() !== args.group.toString()) {
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

      const group = await groupInst.DeltaUpdate(event.group, { visitCount: 1, returnOriginal: true })
      if (group?.disabled) throw new UserInputError('Event is assigned to a disabled group')

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

      await sendWelcomes(visit, danglingEvent)
      pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      await session.commit()
      return visit
    },
    cancelVisit: async (root, args) => {
      const [session, eventInst, groupInst, visitInst] = Transaction.construct(Event, Group, Visit)

      const visit = await visitInst.findById(args.id)
      if (!visit || visit.status === false) throw new UserInputError('Visit not found')

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
        visits: event.visits.filter(v => v.id.toString() !== visit.id),
        availableTimes: calcFromVisitTimes(visitTimes, {
          startTime: new Date(event.start),
          endTime: new Date(event.end)
        }, event.waitingTime, event.duration)
      })
      const danglingVisit = await visitInst.update(visit.id, { status: false })

      await sendCancellation(visit, event)
      await session.commit()
      if (danglingEvent) {
        pubsub.publish('EVENT_MODIFIED', { eventModified: danglingEvent })
      }
      pubsub.publish('EVENT_MODIFIED', { eventModified: event })
      return danglingVisit
    },
    createExtra: authorized(async (root, args) => {
      extraValidate(args)
      return await Extra.insert(args)
    }),
    modifyExtra: authorized(async (root, args) => await Extra.update(args.id, args)),
    deleteExtras: authorized(async (root, args) => await Extra.remove(args.ids)),
    deleteEvents: authorized(async (root, args) => {
      const events = Event.remove(args.ids)
      pubsub.publish('EVENTS_DELETED', { eventsDeleted: args.ids })
      return events
    }),
    forceDeleteEvents: isAdmin(async (root, args, { currentUser }) => {
      const user = await User.findOne({ username: currentUser.username })
      await validPassword(args.password, user.passwordHash)
      const events = []
      for (const id of args.events) {
        const event = await Event.findById(id)
        await Visit.remove(event.visits)
        !!event.group && await Group.DeltaUpdate(event.group, {
          visitCount: - event.visits.length,
          events: { filter: event.id }
        })
        await Event.remove(event.id)
        events.push(event)
      }
      pubsub.publish('EVENTS_DELETED', { eventsDeleted: args.events })
      return events
    }),
    deleteUsers: isAdmin(async (root, args, { currentUser }) => {
      if (args.ids.includes(currentUser.id)) throw new UserInputError('One of the users cannot be removed')
      return User.remove(args.ids)
    }),
    createForm: authorized(async (root, args) => await Form.insert({ ...args, fields: JSON.parse(args.fields) })),
    updateForm: authorized(async (root, args) => await Form.update(args.id, { ...args, fields: JSON.parse(args.fields) })),
    deleteForms: authorized(async (root, args) => await Form.remove(args.ids))
  },
  Subscription: {
    eventModified: { subscribe: () => pubsub.asyncIterator(['EVENT_MODIFIED']) },
    eventsModified: { subscribe: () => pubsub.asyncIterator(['EVENTS_MODIFIED']) },
    eventsDeleted: { subscribe: () => pubsub.asyncIterator(['EVENTS_DELETED']) }
  }
}

module.exports = resolvers