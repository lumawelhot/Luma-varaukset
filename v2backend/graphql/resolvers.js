const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const { findValidTimeSlot, calculateAvailabelTimes, calculateNewTimeSlot, formatAvailableTimes } = require('../utils/timeCalculation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('../services/mailer')
const config = require('../utils/config')
const uuid = require('uuid')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const Extra = require('../models/extra')
const Tag = require('../models/tag')
const Form = require('../models/forms')
const Email = require('../models/email')
const Group = require('../models/group')
const { addNewTags, fillStringWithValues, checkTimeslot } = require('../utils/helpers')
const { sub, set } = require('date-fns')

const { PubSub } = require('graphql-subscriptions')
const { authorized, isAdmin, notFound, minLenghtTest, idNotFound } = require('../utils/errors')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    getUsers: async () => await User.find({}),
    getEvent: async (root, args) => {
      try {
        const event = await Event.findById(args.id)
          .populate('tags', { name: 1, id: 1 })
          .populate('visits')
          .populate('extras')
          .populate('group')
          .populate('customForm')
        return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      } catch (err) {
        throw new UserInputError('Failed to fetch an event')
      }
    },
    getEvents: async (root, args, { currentUser }) => {
      try {
        let date = sub(new Date(), { days: 90 })
        if (currentUser?.isAdmin) date = new Date(0)
        const events = await Event.find({ end: { $gt: date } })
          .populate('tags', { name: 1, id: 1 })
          .populate('visits')
          .populate('extras')
          .populate('group')
          .populate('customForm')
        if (!currentUser) {
          return events
            .filter(e => !e.publishDate || new Date() >= e.publishDate)
            .map(e => {
              if (e.group?.disabled) e.availableTimes = []
              return e
            })
            .map(e => Object.assign(e.toJSON(), { locked: e.reserved ? true : false }))
        }
        return events.map(event => Object.assign(event.toJSON(), { locked: event.reserved ? true : false }))
      } catch (error) {
        throw new UserInputError('Error occured when fetching events')
      }
    },
    getTags: async () => await Tag.find({}),
    getVisits: async (root, args, { currentUser }) => {
      if (!currentUser) return []
      const visits = await Visit.find({})
        .populate('event', { id: 1, title: 1, resourceids: 1, remoteVisit: 1, inPersonVisit : 1 })
        .populate('extras')
      visits.forEach(visit => {
        visit.customFormData ? visit.customFormData = JSON.stringify(visit.customFormData) : null
      })
      return visits
    },
    getEmailTemplates: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      return await Email.find({})
    },
    getGroups: async (root, args, { currentUser }) => {
      authorized(currentUser)
      return await Group.find({}).populate('events')
    },
    findVisit: async (root, args) => notFound(await Visit.findById(args.id).populate('extras')).toJSON(),
    me: (root, args, context) => context.currentUser,
    getExtras: async () => await Extra.find({}),
    getForm: async (root, args) => notFound(await Form.findById(args.id)),
    getForms: async () => await Form.find({}),
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event).populate('tags', { name: 1, id: 1 }).populate('extras')
      if (!event) return null
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    startTime: (data) => new Date(data.startTime).toISOString(),
    endTime: (data) => new Date(data.endTime).toISOString()
  },
  Form: {
    fields: (form) => JSON.stringify(form.fields)
  },
  Group: {
    publishDate: (group) => group.publishDate ? new Date(group.publishDate).toISOString() : null
  },
  Event: {
    publishDate: (event) => event.publishDate ? new Date(event.publishDate).toISOString() : null
  },
  Mutation: {
    createGroup: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const group = new Group({
        ...args,
        visitCount: 0,
        events: [],
        disabled: false
      })
      return await group.save()
    },
    modifyGroup: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const group = await Group.findById(args.id)
      group.name = args.name ? args.name : group.name
      group.maxCount = group.visitCount <= args.maxCount ? args.maxCount : group.maxCount
      group.publishDate = args.publishDate ? new Date(args.publishDate) : undefined
      group.disabled = args.disabled || group.maxCount <= group.visitCount
      return await group.save()
    },
    deleteGroups: async (root, args, { currentUser }) => {
      authorized(currentUser)
      idNotFound(args.ids)
      try {
        const groups = await Group.find({ _id: { $in: args.ids } })
        for (let group of groups) {
          for (let id of group.events) {
            const event = await Event.findById(id)
            event.disabled = true
            await event.save()
          }
        }
        await Group.deleteMany({ _id: { $in: args.ids } })
        return 'Success'
      } catch (error) {
        console.log(error)
        throw new UserInputError('Backend problem')
      }
    },
    assignPublishDateToEvents: async (root, args, { currentUser }) => {
      authorized(currentUser)
      try {
        let returnedEvents = []
        const events = await Event.find({ _id: { $in: args.events } })
        for (let event of events) {
          event.publishDate = args.publishDate ? new Date(args.publishDate) : undefined
          await event.save()
          returnedEvents.push(event)
        }
        return returnedEvents.map(event => Object.assign(event.toJSON(), { locked: event.reserved ? true : false }))
      } catch (error) {
        throw new UserInputError('Backend problem')
      }
    },
    assignEventsToGroup: async (root, args, { currentUser }) => {
      authorized(currentUser)
      let returnedEvents = []
      for (let e of args.events) {
        const event = await Event.findById(e)
        if (event && (!event.group || event.group.toString() !== args.group.toString())) {
          let group
          const oldGroup = await Group.findById(event.group)
          if (oldGroup) {
            oldGroup.events = oldGroup.events.filter(e => e.toString() !== event.id)
            event.group = null
            oldGroup.visitCount = oldGroup.visitCount - event.visits.length
          }
          if (args.group) {
            group = await Group.findById(args.group)
            if (group) {
              event.group = group.id
              group.events = group.events.concat(event.id)
              group.visitCount = group.visitCount + event.visits.length
            }
            if (group.visitCount > group.maxCount) {
              throw new UserInputError('max number of visits exceeded')
            }
            if (group.visitCount === group.maxCount) {
              group.disabled = true
            }
          }
          await event.save()
          if (group) await group.save()
          if (oldGroup) await oldGroup.save()
          returnedEvents.push(event)
        }
      }
      return returnedEvents
    },
    updateEmail: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      return await Email.findOneAndUpdate({ name: args.name }, { ...args }, { returnOriginal: false })
    },
    updateUser: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      minLenghtTest(args.username, 5)
      const user = await User.findById(args.user)
      if (user.username === currentUser.username) {
        throw new UserInputError('admin user cannot remove own permissions')
      }
      try {
        user.username = args.username
        user.isAdmin = args.isAdmin
        if (args.password) {
          const salt = 10
          const passwordHash = await bcrypt.hash(args.password, salt)
          user.passwordHash = passwordHash
        }
        return await user.save()
      } catch (error) {
        throw new UserInputError('failed to save username')
      }
    },
    resetPassword: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      const salt = 10
      const passwordHash = await bcrypt.hash(args.password, salt)
      const user = await User.findById(args.user)
      user.passwordHash = passwordHash
      return await user.save()
    },
    changeUsername: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      minLenghtTest(args.username, 5)
      const user = await User.findById(args.user)
      if (user.username === currentUser.username) {
        throw new UserInputError('admin user cannot remove own permissions')
      }
      try {
        user.username = args.username
        user.isAdmin = args.isAdmin
        return await user.save()
      } catch (error) {
        throw new UserInputError('failed to save username')
      }
    },
    createUser: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      minLenghtTest(args.username, 5)
      const salt = 10
      const passwordHash = await bcrypt.hash(args.password, salt)
      const user = new User({
        username: args.username,
        passwordHash,
        isAdmin: args.isAdmin,
      })
      return await user.save()
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.passwordHash)
      if (!(user && passwordCorrect)) throw new UserInputError('Wrong credentials!')
      const userForToken = { username: user.username, id: user._id }
      return { value: jwt.sign(userForToken, config.SECRET, { expiresIn: '12h' }) }
    },
    createEvent: async (root, args, { currentUser }) => {
      authorized(currentUser)
      minLenghtTest(args.grades, 1)
      minLenghtTest(args.title, 5)
      if (checkTimeslot(args.start, args.end)) throw new UserInputError('Invalid start or end time')

      const group = await Group.findById(args.group)
      const mongoTags = await addNewTags(args.tags)
      const extras = await Extra.find({ _id: { $in: args.extras } })

      const event = new Event({
        ...args,
        availableTimes: [{
          startTime: args.start,
          endTime: args.end
        }],
        disabled: false,
        resourceids: args.scienceClass,
        publishDate: args.publishDate ? new Date(args.publishDate) : null,
      })

      event.extras = extras
      event.tags = mongoTags
      if (group) {
        group.events = group.events.concat(event.id)
        event.group = group.id
        await group.save()
      }
      await event.save()
      await event.populate('group').populate('customForm').execPopulate()
      pubsub.publish('EVENT_CREATED', {
        eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      })
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    createEvents: async (root, args, { currentUser }) => {
      authorized(currentUser)
      minLenghtTest(args.grades, 1)
      minLenghtTest(args.title, 5)
      if (checkTimeslot(args.start, args.end)) throw new UserInputError('Invalid start or end time')

      const group = await Group.findById(args.group)
      const mongoTags = await addNewTags(args.tags)
      const extras = await Extra.find({ _id: { $in: args.extras } })

      const events = []

      for (let d of args.dates) {
        const date = new Date(d)
        const startTime = new Date(args.start)
        const endTime = new Date(args.end)

        const start = set(date, { hours: startTime.getHours(), minutes: startTime.getMinutes(), seconds: 0, milliseconds: 0 }).toISOString()
        const end = set(date, { hours: endTime.getHours(), minutes: endTime.getMinutes(), seconds: 0, milliseconds: 0 }).toISOString()

        const event = new Event({
          ...args,
          start,
          end,
          availableTimes: [{
            startTime: start,
            endTime: end
          }],
          disabled: false,
          resourceids: args.scienceClass,
          publishDate: args.publishDate ? new Date(args.publishDate) : null,
        })

        event.extras = extras
        event.tags = mongoTags
        if (group) {
          group.events = group.events.concat(event.id)
          event.group = group.id
          await group.save()
        }
        await event.save()
        await event.populate('group').populate('customForm').execPopulate()
        pubsub.publish('EVENT_CREATED', {
          eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
        })
        events.push(Object.assign(event.toJSON(), { locked: event.reserved ? true : false }))
      }
      return events
    },
    disableEvent: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const event = notFound(await Event.findById(args.event))
      event.disabled = true
      event.save()
      pubsub.publish('EVENT_DISABLED', {
        eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      })
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    enableEvent: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const event = notFound(await Event.findById(args.event))
      event.disabled = false
      event.reserved = null
      event.save()
      pubsub.publish('EVENT_ENABLED', {
        eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      })
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    lockEvent: async (root, args) => {
      const event = notFound(await Event.findById(args.event))
      if (event.reserved) throw new UserInputError('Older session is already active')
      if (event.disabled) throw new UserInputError('This event is disabled')

      const token = uuid.v4()
      event.reserved = token
      setTimeout(() => {
        event.reserved = null
        event.save()
        pubsub.publish('EVENT_UNLOCKED', {
          eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
        })
      }, 610000)

      await event.save()
      pubsub.publish('EVENT_LOCKED', {
        eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      })
      return {
        event: event.id,
        token,
        locked: event.reserved ? true : false
      }
    },
    unlockEvent: async (root, args) => {
      const event = notFound(await Event.findByIdAndUpdate(args.event, { reserved: null }, { returnOriginal: false }))
      pubsub.publish('EVENT_UNLOCKED', { eventModified: event })
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    modifyEvent: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const extras = await Extra.find({ _id: { $in: args.extras } })
      const update = { ...args }
      delete update.tags
      delete update.group
      const event = notFound(await Event.findByIdAndUpdate(args.event, { ...update }, { returnOriginal: false })
        .populate('visits')
        .populate('customForm'))
      if (checkTimeslot(args.start ? args.start : event.start, args.end ? args.end : event.end)) throw new UserInputError('invalid start or end')
      if (event.reserved) throw new UserInputError('Event cannot be modified because booking form is open')
      let group
      let oldGroup
      if (!event.group || event.group.toString() !== args.group.toString()) {
        oldGroup = await Group.findById(event.group)
        if (oldGroup) {
          oldGroup.events = oldGroup.events.filter(e => e.toString() !== event.id)
          event.group = null
          oldGroup.visitCount = oldGroup.visitCount - event.visits.length
        }
        if (args.group) {
          group = await Group.findById(args.group)
          if (group) {
            event.group = group.id
            group.events = group.events.concat(event.id)
            group.visitCount = group.visitCount + event.visits.length
          }
          if (group.visitCount > group.maxCount) {
            throw new UserInputError('max number of visits exceeded')
          }
          if (group.visitCount === group.maxCount) {
            group.disabled = true
          }
        }
      }

      event.extras = extras
      event.tags = await addNewTags(args.tags)
      if (event.visits.length) {
        const newTimeSlot = calculateNewTimeSlot(
          event.visits,
          args.start ? new Date(args.start) : new Date(event.start),
          args.end ? new Date(args.end) : new Date(event.end)
        )
        if (newTimeSlot) {
          const eventTimes = {
            start: new Date(newTimeSlot.start),
            end: new Date(newTimeSlot.end)
          }
          const newAvailableTimes = calculateAvailabelTimes(event.visits, eventTimes, event.waitingTime, event.duration)
          event.start = newTimeSlot.start.toISOString()
          event.end = newTimeSlot.end.toISOString()
          event.availableTimes = formatAvailableTimes(newAvailableTimes)
        } else {
          throw new UserInputError('invalid start or end')
        }
      } else {
        args.start ? event.start = args.start : null
        args.end ? event.end = args.end : null
        event.availableTimes = [{
          startTime: args.start ? args.start : event.start.toISOString(),
          endTime: args.end ? args.end : event.end.toISOString()
        }]
      }
      await event.save()
      await event.populate('group').execPopulate()
      if (group) await group.save()
      if (oldGroup) await oldGroup.save()
      pubsub.publish('EVENT_MODIFIED', {
        eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
      })
      return Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
    },
    createVisit: async (root, args, { currentUser }) => {
      const event = notFound(await Event.findById(args.event).populate('visits', { startTime: 1, endTime: 1 }))
      if (event.reserved && event.reserved !== args.token) throw new UserInputError('Invalid session')
      if (event.disabled) throw new UserInputError('This event is disabled')
      let group
      if (event.group) {
        group = await Group.findById(event.group)
        if (group) {
          if (group.disabled) {
            throw new UserInputError('this group is disabled')
          }
          group.visitCount = group.visitCount + 1
          if (group.visitCount === group.maxCount) {
            group.disabled = true
          } else if (group.visitCount > group.maxCount) {
            throw new UserInputError('this group has maximum amount of visits')
          }
        }
      }

      const visitTime = {
        startTime: new Date(args.startTime),
        endTime: new Date(args.endTime)
      }
      const availableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))
      const eventTime = {
        start: new Date(event.start),
        end: new Date(event.end)
      }
      const visitTimes = event.visits.concat(visitTime)

      if (!findValidTimeSlot(availableTimes, visitTime)) {
        throw new UserInputError('Given timeslot is invalid')
      }

      event.availableTimes = calculateAvailabelTimes(visitTimes, eventTime, event.waitingTime, event.duration)

      const visit = new Visit({
        ...args,
        event: event,
        status: true,
        extras: [],
        customFormData: args.customFormData ? JSON.parse(args.customFormData) : null
      })
      const extras = await Extra.find({ _id: { $in: args.extras } })
      visit.extras = extras

      let savedVisit
      event.availableTimes = formatAvailableTimes(event.availableTimes)
      try {
        const now = new Date()
        const start = new Date(event.start)
        const startsAfter14Days = start - now >= 1209600000
        const startsAfter1Hour = start - now >= 3600000
        const eventCanBeBooked = !currentUser ? startsAfter14Days : startsAfter1Hour
        if (eventCanBeBooked) {
          savedVisit = await visit.save()
          const details = [
            {
              name: 'link',
              value: `${config.HOST_URI}/${savedVisit.id}`
            },
            {
              name: 'visit',
              value: `${event.title} ${visit.startTime}-${visit.endTime}`
            }
          ]
          const mail = await Email.findOne({ name: 'welcome' })
          if (process.env.NODE_ENV !== 'test') {
            await mailer.sendMail({
              from: 'Luma-Varaukset <noreply@helsinki.fi>',
              to: visit.clientEmail,
              subject: mail.subject,
              text: fillStringWithValues(mail.text, details),
              html: fillStringWithValues(mail.html, details)
            })
            mail.ad.forEach(recipient => {
              mailer.sendMail({
                from: 'Luma-Varaukset <noreply@helsinki.fi>',
                to: recipient,
                subject: mail.adSubject,
                text: fillStringWithValues(mail.adText, details)
              })
            })
          }
          event.visits = event.visits.concat(savedVisit._id)
          event.reserved = null
          if (group) await group.save()
          await event.save()
          pubsub.publish('EVENT_BOOKED', {
            eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
          })
          savedVisit.customFormData ? savedVisit.customFormData = JSON.stringify(savedVisit.customFormData) : null
          return savedVisit
        }
      } catch (error) {
        event.availableTimes = availableTimes.map(availableTime => availableTime.toISOString())
        await event.save()
        await savedVisit.delete()
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    cancelVisit: async (root, args) => {
      const visit = await Visit.findById(args.id)
      if (!visit || visit.status === false) throw new UserInputError('Varausta ei löydy')
      const event = notFound(await Event.findById(visit.event)
        .populate('extras', { name: 1 })
        .populate('visits', { startTime: 1, endTime: 1 })
        .populate('tags', { name: 1 }))

      const detailsForMail = [{
        name: 'visit',
        value: `${event.title} ${visit.startTime}-${visit.endTime}`
      }]

      const oldAvailableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))
      let group
      let newEvent
      if (event.group) {
        group = await Group.findById(event.group)
        if (group.disabled) {
          const mongoTags = await addNewTags(event.tags.map(tag => tag.name))
          const extras = await Extra.find({ _id: { $in: event.extras } })
          const eventObject = event.toObject()
          const del = ['_id', '__v', 'group', 'visits']
          del.forEach(e => delete eventObject[e])

          newEvent = new Event({
            ...eventObject,
            disabled: false,
            start: new Date(visit.startTime),
            end: new Date(visit.endTime),
            availableTimes: [{
              startTime: visit.startTime.toISOString(),
              endTime: visit.endTime.toISOString()
            }],
          })
          newEvent.extras = extras
          newEvent.tags = mongoTags
        }
        group.visitCount = group.visitCount - 1
      }
      const visitTimes = event.visits.filter(v => v.id !== visit.id)

      const eventTime = {
        start: new Date(event.start),
        end: new Date(event.end)
      }
      let newAvailTimes = calculateAvailabelTimes(visitTimes, eventTime, event.waitingTime, event.duration)

      newAvailTimes = newAvailTimes.map(time => {
        if (typeof time.startTime === 'string') return time
        return {
          startTime: time.startTime.toISOString(),
          endTime: time.endTime.toISOString()
        }
      })

      try {
        event.visits = event.visits.filter(v => v.id.toString() !== visit.id)
        event.availableTimes = newAvailTimes
        visit.status = false
        await visit.save()
        await event.save()
        pubsub.publish('EVENT_RESERVATION_CANCELLED', {
          eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
        })
        const mail = await Email.findOne({ name: 'cancellation' })
        if (process.env.NODE_ENV !== 'test') {
          await mailer.sendMail({
            from: 'Luma-Varaukset <noreply@helsinki.fi>',
            to: visit.clientEmail,
            subject: mail.subject,
            text: fillStringWithValues(mail.text, detailsForMail),
            html: fillStringWithValues(mail.html, detailsForMail)
          })
          mail.ad.forEach(recipient => {
            mailer.sendMail({
              from: 'Luma-Varaukset <noreply@helsinki.fi>',
              to: recipient,
              subject: mail.adSubject,
              text: fillStringWithValues(mail.adText, detailsForMail)
            })
          })
        }
        if (group) await group.save()
        if (newEvent) {
          await newEvent.save()
          pubsub.publish('EVENT_CREATED', {
            eventModified: Object.assign(newEvent.toJSON(), { locked: event.reserved ? true : false })
          })
        }
        return visit
      } catch (error) {
        event.visits = event.visits.concat(visit._id)
        event.availableTimes = oldAvailableTimes
        visit.status = true
        await event.save()
        await visit.save()
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    createExtra: async (root, args, { currentUser }) => {
      authorized(currentUser)
      minLenghtTest(args.name, 3)
      minLenghtTest(args.classes, 1)
      minLenghtTest(args.remoteLength + args.inPersonLength, 1)
      try {
        return await new Extra({ ...args }).save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    modifyExtra: async (root, args, { currentUser }) => {
      authorized(currentUser)
      try {
        return await Extra.findByIdAndUpdate(args.id, { ...args }, { returnOriginal: false })
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    deleteExtras: async (root, args, { currentUser }) => {
      authorized(currentUser)
      idNotFound(args.ids)
      try {
        await Extra.deleteMany({ _id: { $in: args.ids } })
        return 'Success'
      } catch (error) {
        throw new UserInputError('Backend problem')
      }
    },
    deleteEvent: async (root, args, { currentUser }) => { // deprecated
      authorized(currentUser)
      idNotFound(args.id)
      try {
        const event = await Event.findById(args.id)
        if (event.visits.length) {
          throw new UserInputError('Event has visits!')
        }
        await Event.deleteOne({ _id:args.id })
        pubsub.publish('EVENT_DELETED', {
          eventModified: Object.assign(event.toJSON(), { locked: event.reserved ? true : false })
        })
        return 'Deleted Event with ID ' + args.id
      } catch (error) {
        throw new UserInputError('Event has visits!')
      }
    },
    deleteEvents: async (root, args, { currentUser }) => {
      authorized(currentUser)
      const validIds = []
      for (let id of args.ids) {
        try {
          const event = await Event.findById(id)
          if (!event.visits.length) validIds.push(id)
        } catch (err) { undefined }
      }
      try {
        await Event.deleteMany({ _id: { $in: validIds } })
        /* pubsub.publish('EVENTS_DELETED', {
          eventsDeleted: success
        }) */ // <--- HERE SOMETHING ???
        return validIds
      } catch (error) {
        throw new UserInputError('Error occured')
      }
    },
    forceDeleteEvents: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      const user = notFound(await User.findOne({ username: currentUser.username }))
      const passwordCorrect = await bcrypt.compare(args.password, user.passwordHash)
      if (!passwordCorrect) throw new AuthenticationError('incorrect password')
      const success = []
      try {
        for (const eventId of args.events) {
          const event = await Event.findById(eventId)
          await Visit.deleteMany({ _id: event.visits })
          await Event.deleteOne({ _id: event._id })
          success.push(event)
        }
        pubsub.publish('EVENTS_DELETED', {
          eventsDeleted: success
        })
        return success
      } catch (error) {
        throw new UserInputError('Error occured')
      }
    },
    deleteUsers: async (root, args, { currentUser }) => {
      isAdmin(currentUser)
      idNotFound(args.ids)
      if (args.ids.includes(currentUser.id)) throw new UserInputError('One of the users cannot be removed')
      try {
        await User.deleteMany({ _id: { $in: args.ids } })
        return 'Success'
      } catch (err) {
        throw new UserInputError('User deletion failed')
      }
    },
    createForm: async (root, args, { currentUser }) => {
      authorized(currentUser)
      try {
        const form = new Form({
          name: args.name,
          fields: JSON.parse(args.fields)
        })
        return await form.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    updateForm: async (root, args, { currentUser }) => {
      authorized(currentUser)
      try {
        const form = await Form.findById(args.id)
        form.name = args.name
        form.fields = JSON.parse(args.fields)
        form.markModified('fields')
        return form.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    deleteForms: async (root, args, { currentUser }) => {
      authorized(currentUser)
      try {
        await Form.deleteMany({ _id: { $in: args.ids } })
        return 'Success'
      } catch (error) {
        throw new UserInputError('Form deletion failed')
      }
    }
  },
  Subscription: {
    eventModified: {
      subscribe: () => pubsub.asyncIterator([
        'EVENT_LOCKED',
        'EVENT_UNLOCKED',
        'EVENT_CREATED',
        'EVENT_MODIFIED',
        'EVENT_DISABLED',
        'EVENT_ENABLED',
        'EVENT_BOOKED',
        'EVENT_RESERVATION_CANCELLED',
        'EVENT_DELETED'
      ])
    },
    eventsDeleted: {
      subscribe: () => pubsub.asyncIterator(['EVENTS_DELETED'])
    }
  }
}

module.exports = resolvers