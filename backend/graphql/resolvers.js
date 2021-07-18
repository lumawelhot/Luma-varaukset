const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const { readMessage } = require('../services/fileReader')
const { findValidTimeSlot, calculateAvailabelTimes, calculateNewTimeSlot, formatAvailableTimes } = require('../utils/timeCalculation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('../services/mailer')
const config = require('../utils/config')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const Extra = require('../models/extra')
const Tag = require('../models/tag')
const Form = require('../models/forms')
const FormSubmissions = require('../models/formSubmissions')
const { addNewTags } = require('../utils/helpers')

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async () => {
      const date = new Date()
      date.setDate(date.getDate() - 90)
      const events = await Event.find({ end: { $gt: date.toISOString() } })
        .populate('tags', { name: 1, id: 1 })
        .populate('visits')
        .populate('extras')
      return events
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
    getFormSubmissions: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      try {
        const formSubmissions = await Form.findById(args.id).populate('submissions')
        return formSubmissions
      } catch (error) {
        throw new UserInputError('Form submissions not found!')
      }
    },
    getFormSubmission: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated or no credentials')
      }
      try {
        const formValues = await FormSubmissions.findById(args.id)
        return formValues
      } catch (e) {
        throw new UserInputError('Form submission not found!')
      }
    }
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event).populate('tags', { name: 1, id: 1 }).populate('extras')
      return event
    },
  },
  Form: {
    fields: (form) => JSON.stringify(form.fields)
  },
  FormSubmissions: {
    values: (submission) => JSON.stringify(submission.values)
  },
  Mutation: {
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

      const mongoTags = await addNewTags(args.tags)

      const extras = await Extra.find({ _id: { $in: args.extras } })

      const newEvent = new Event({
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
        customForm: args.customForm
      })

      newEvent.extras = extras
      newEvent.tags = mongoTags
      await newEvent.save()
      return newEvent
    },
    modifyEvent: async (root, args, { currentUser }) => {
      const extras = await Extra.find({ _id: { $in: args.extras } })
      const { title, desc, resourceids, grades, remotePlatforms, otherRemotePlatformOption, remoteVisit, inPersonVisit, customForm } = args
      const event = await Event.findById(args.event).populate('visits')
      if (!currentUser) throw new AuthenticationError('not authenticated')
      if (new Date(args.start).getHours() < 8) throw new UserInputError('invalid start time')
      if (new Date(args.end).getHours() > 17) throw new UserInputError('invalid end time')

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
      return event
    },
    createVisit: async (root, args, { currentUser }) => {
      const event = await Event.findById(args.event).populate('visits', { startTime: 1, endTime: 1 })
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
        extras: []
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
          await event.save()
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
        return 'Deleted Event with ID ' + args.id
      } catch (error) {
        throw new UserInputError('Event has visits!')
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
    },
    createFormSubmission: async (root, args) => {
      try {
        const form = await Form.findById(args.formID)
        const newFormSubmissions = new FormSubmissions({
          form,
          values: JSON.parse(args.values)
        })
        const savedFormSubmissions = await newFormSubmissions.save()
        return savedFormSubmissions
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }
    }
  }
}

module.exports = resolvers