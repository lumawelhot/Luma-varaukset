const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const { readMessage } = require('../services/fileReader')
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
const { addNewTags } = require('../utils/helpers')
const { set, sub } = require('date-fns')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async (root, args, { currentUser }) => {
      let events
      if (currentUser && currentUser.isAdmin) {
        events = await Event.find({})
          .populate('tags', { name: 1, id: 1 })
          .populate('visits')
          .populate('extras')
      } else {
        const date = sub(new Date(), { days: 90 })
        events = await Event.find({ end: { $gt: date.toISOString() } })
          .populate('tags', { name: 1, id: 1 })
          .populate('visits')
          .populate('extras')
      }
      return events.map(event => Object.assign(event, { locked: event.reserved ? true : false }))
    },
    getTags: async () => {
      const tags = await Tag.find({})
      return tags
    },
    getVisits: async (root, args, { currentUser }) => {
      if (!currentUser) {
        return []
      }
      const visits = await Visit.find({})
        .populate('event', { id: 1, title: 1, resourceids: 1, remoteVisit: 1, inPersonVisit : 1 })
        .populate('extras')
      return visits
    },
    findVisit: async (root, args) => {
      try {
        const visit = await Visit.findById(args.id).populate('extras')
        return visit
      } catch (e) {
        throw new UserInputError('Varausta ei löytynyt!')
      }
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    getExtras: async () => {
      const extras = await Extra.find({})
      return extras
    },
    getForm: async (root, args) => {
      try {
        const form = await Form.findById(args.id)
        return form
      } catch (e) {
        throw new UserInputError('Form not found!')
      }
    },
    getForms: async () => {
      const forms = await Form.find({})
      return forms
    },
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event).populate('tags', { name: 1, id: 1 }).populate('extras')
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    customFormData: (data) => data.customFormData ? JSON.stringify(data.customFormData) : null
  },
  Form: {
    fields: (form) => JSON.stringify(form.fields)
  },
  Mutation: {
    resetPassword: async (root, args, { currentUser }) => {
      if (!currentUser || !currentUser.isAdmin) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      const salt = 10
      const passwordHash = await bcrypt.hash(args.password, salt)
      const user = await User.findById(args.user)
      user.passwordHash = passwordHash
      await user.save()
      return user
    },
    changeUsername: async (root, args, { currentUser }) => {
      if (!currentUser || !currentUser.isAdmin) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      if (args.username.length < 5) {
        throw new UserInputError('username too short')
      }
      const user = await User.findById(args.user)
      if (user.username === currentUser.username && !args.isAdmin) {
        throw new UserInputError('admin user cannot remove its rigts')
      }
      try {
        user.username = args.username
        user.isAdmin = args.isAdmin
        await user.save()
        return user
      } catch (error) {
        throw new UserInputError('failed to save username')
      }
    },
    createUser: async (root, args, { currentUser }) => {
      if (!currentUser || currentUser.isAdmin !== true) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      if (args.username.length < 5) {
        throw new UserInputError('username too short')
      }
      const salt = 10
      const passwordHash = await bcrypt.hash(args.password, salt)
      const newUser = new User({
        username: args.username,
        passwordHash,
        isAdmin: args.isAdmin,
      })
      await newUser.save()
      return newUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.passwordHash)
      if (!(user && passwordCorrect)) {
        throw new UserInputError('Wrong credentials!')
      }
      const userForToken = { username: user.username, id: user._id }
      return { value: jwt.sign(userForToken, config.SECRET) }
    },
    createEvent: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated')
      if (args.grades.length < 1) throw new UserInputError('At least one grade must be selected!')
      if (args.title.length < 5)  throw new UserInputError('title too short')
      if (new Date(args.start).getTime() < set(new Date(args.start), { hours: 8, minutes: 0, seconds: 0 }).getTime()) throw new UserInputError('invalid start time')
      if (new Date(args.end).getTime() > set(new Date(args.end), { hours: 17, minutes: 0, seconds: 0 }).getTime()) throw new UserInputError('invalid end time')

      const mongoTags = await addNewTags(args.tags)

      const extras = await Extra.find({ _id: { $in: args.extras } })

      const event = new Event({
        title: args.title,
        start: args.start,
        end: args.end,
        desc: args.desc,
        resourceids: args.scienceClass,
        grades: args.grades,
        remotePlatforms: args.remotePlatforms,
        otherRemotePlatformOption: args.otherRemotePlatformOption,
        remoteVisit: args.remoteVisit,
        inPersonVisit: args.inPersonVisit,
        waitingTime: args.waitingTime,
        availableTimes: [{
          startTime: args.start,
          endTime: args.end
        }],
        duration: args.duration,
        customForm: args.customForm,
        disabled: false
      })

      event.extras = extras
      event.tags = mongoTags
      await event.save()
      pubsub.publish('EVENT_CREATED', {
        eventModified: Object.assign(event, { locked: event.reserved ? true : false })
      })
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    disableEvent: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated')

      const event = await Event.findById(args.event)

      event.disabled = true
      event.save()
      pubsub.publish('EVENT_DISABLED', {
        eventModified: Object.assign(event, { locked: event.reserved ? true : false })
      })
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    enableEvent: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated')

      const event = await Event.findById(args.event)

      event.disabled = false
      event.reserved = null
      event.save()
      pubsub.publish('EVENT_ENABLED', {
        eventModified: Object.assign(event, { locked: event.reserved ? true : false })
      })
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    lockEvent: async (root, args) => {
      const event = await Event.findById(args.event)
      if (event.reserved) throw new UserInputError('Older session is already active')
      if (event.disabled) throw new UserInputError('This event is disabled')

      const token = uuid.v4()
      event.reserved = token
      setTimeout(() => {
        event.reserved = null
        event.save()
        pubsub.publish('EVENT_UNLOCKED', {
          eventModified: Object.assign(event, { locked: event.reserved ? true : false })
        })
      }, 305000)

      await event.save()
      pubsub.publish('EVENT_LOCKED', {
        eventModified: Object.assign(event, { locked: event.reserved ? true : false })
      })
      return {
        event: event.id,
        token,
        locked: event.reserved ? true : false
      }
    },
    unlockEvent: async (root, args) => {
      const event = await Event.findById(args.event)

      event.reserved = null
      await event.save()
      pubsub.publish('EVENT_UNLOCKED', { eventModified: event })
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    modifyEvent: async (root, args, { currentUser }) => {
      const extras = await Extra.find({ _id: { $in: args.extras } })
      const { title, desc, resourceids, grades, remotePlatforms, otherRemotePlatformOption, remoteVisit, inPersonVisit, customForm } = args
      const event = await Event.findById(args.event).populate('visits')
      if (!currentUser) throw new AuthenticationError('not authenticated')
      if (new Date(args.start).getTime() < set(new Date(args.start), { hours: 8, minutes: 0, seconds: 0 }).getTime()) throw new UserInputError('invalid start time')
      if (new Date(args.end).getTime() > set(new Date(args.end), { hours: 17, minutes: 0, seconds: 0 }).getTime()) throw new UserInputError('invalid end time')
      if (event.reserved) throw new UserInputError('Event cannot be modified because booking form is open')

      title !== undefined ? event.title = title : null
      desc !== undefined ? event.desc = desc : null
      resourceids !== undefined ? event.resourceids = resourceids : null
      grades !== undefined ? event.grades = grades : null
      remotePlatforms !== undefined ? event.remotePlatforms = remotePlatforms : null
      otherRemotePlatformOption !== undefined ? event.otherRemotePlatformOption = otherRemotePlatformOption : null
      remoteVisit !== undefined ? event.remoteVisit = remoteVisit : null
      inPersonVisit !== undefined ? event.inPersonVisit = inPersonVisit : null
      customForm !== undefined ? event.customForm = customForm : null
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
          startTime: args.start ? args.start : event.start,
          endTime: args.end ? args.end : event.end
        }]
      }
      await event.save()
      pubsub.publish('EVENT_MODIFIED', {
        eventModified: Object.assign(event, { locked: event.reserved ? true : false })
      })
      return Object.assign(event, { locked: event.reserved ? true : false })
    },
    createVisit: async (root, args, { currentUser }) => {
      const event = await Event.findById(args.event).populate('visits', { startTime: 1, endTime: 1 })
      if (event.reserved && event.reserved !== args.token) throw new UserInputError('Invalid session')
      if (event.disabled) throw new UserInputError('This event is disabled')

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
          const details = [{
            name: 'link',
            value: `${config.HOST_URI}/${savedVisit.id}`
          }]
          const text = await readMessage('welcome.txt', details)
          const html = await readMessage('welcome.html', details)
          mailer.sendMail({
            from: 'Luma-Varaukset <noreply@helsinki.fi>',
            to: visit.clientEmail,
            subject: 'Tervetuloa!',
            text,
            html
          })
          event.visits = event.visits.concat(savedVisit._id)
          event.reserved = null
          await event.save()
          pubsub.publish('EVENT_BOOKED', {
            eventModified: Object.assign(event, { locked: event.reserved ? true : false })
          })
          savedVisit.customFormData ? savedVisit.customFormData = JSON.stringify(savedVisit.customFormData) : null
          return savedVisit
        }
      } catch (error) {
        event.availableTimes = availableTimes
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
      const event = await Event.findById(visit.event).populate('visits', { startTime: 1, endTime: 1 })
      const oldAvailableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))
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
          eventModified: Object.assign(event, { locked: event.reserved ? true : false })
        })
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
      if (!currentUser) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      if(args.name.length < 3){
        throw new UserInputError('Name too short!')
      }
      if(args.classes.length === 0) {
        throw new UserInputError('Select at least one science class!')
      }
      if(args.remoteLength === 0 && args.inPersonLength === 0){
        throw new UserInputError('Give duration for at least one mode!')
      }
      try {
        const newExtra = new Extra({
          ...args
        })
        const savedExtra = await newExtra.save()
        return savedExtra
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    deleteExtra: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      if (!args.id) {
        throw new UserInputError('No ID provided!')
      }
      try {
        await Extra.deleteOne({ _id:args.id })
        return 'Deleted Extra with ID ' + args.id
      } catch (error) {
        throw new UserInputError('Backend problem')
      }
    },
    deleteEvent: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      if (!args.id) {
        throw new UserInputError('No ID provided!')
      }
      try {
        const event = await Event.findById(args.id)
        if (event.visits.length) {
          throw new UserInputError('Event has visits!')
        }
        await Event.deleteOne({ _id:args.id })
        pubsub.publish('EVENT_DELETED', {
          eventModified: Object.assign(event, { locked: event.reserved ? true : false })
        })
        return 'Deleted Event with ID ' + args.id
      } catch (error) {
        throw new UserInputError('Event has visits!')
      }
    },
    forceDeleteEvents: async (root, args, { currentUser }) => {
      if (!currentUser || !currentUser.isAdmin) {
        throw new AuthenticationError('not authenticatd or no admin priviledges')
      }
      const user = await User.findOne({ username: currentUser.username })
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.passwordHash)
      if (!user || !passwordCorrect) {
        throw new AuthenticationError('incorrect password')
      }
      const success = []
      try {
        for (const eventId of args.events) {
          try {
            const event = await Event.findById(eventId)
            await Visit.deleteMany({ _id: event.visits })
            await Event.deleteOne({ _id: event._id })
            success.push(event)
          } catch (e) { null }
        }
        pubsub.publish('EVENTS_DELETED', {
          eventsDeleted: success
        })
        return success
      } catch (error) {
        throw new UserInputError('Error occured')
      }
    },
    deleteUser: async (root, args, { currentUser }) => {
      if (!currentUser || !currentUser.isAdmin) {
        throw new AuthenticationError('not authenticated or no admin priviledges')
      }
      if (args.id === currentUser.id) {
        throw new UserInputError('This user cannot be removed')
      }
      if (!args.id) {
        throw new UserInputError('No ID provided!')
      }
      try {
        await User.deleteOne({ _id: args.id })
        return 'Deleted user with ID ' + args.id
      } catch (error) {
        throw new UserInputError('User deletion failed')
      }
    },
    createForm: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      try {
        const newForm = new Form({
          name: args.name,
          fields: JSON.parse(args.fields)
        })
        const savedForm = await newForm.save()
        return savedForm
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    updateForm: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      try {
        const form = await Form.findById(args.id)
        form.name = args.name
        form.fields = JSON.parse(args.fields)
        form.markModified('fields')
        await form.save()
        return form
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    },
    deleteForm: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      try {
        await Form.deleteOne({ _id: args.id })
        return 'Deleted form with ID ' + args.id
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