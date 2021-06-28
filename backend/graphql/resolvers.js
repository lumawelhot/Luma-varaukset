const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const { readMessage } = require('../services/fileReader')
const { add, sub } = require('date-fns')
const { findValidTimeSlot, findClosestTimeSlot, generateAvailableTime } = require('../utils/timeCalculation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('../services/mailer')
const config = require('../utils/config')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const Extra = require('../models/extra')
const Tag = require('../models/tag')

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async () => {
      const events = await Event.find({}).populate('tags', { name: 1, id: 1 }).populate('visits').populate('extras')
      return events
    },
    getTags: async () => {
      const tags = await Tag.find({})
      return tags
    },
    getVisits: async () => {
      const visits = await Visit.find({}).populate('event', { id: 1, title: 1, resourceids: 1, remoteVisit: 1, inPersonVisit : 1 })
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
    }
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event).populate('tags', { name: 1, id: 1 }).populate('extras')
      return event
    },
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
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      let resourceids = args.scienceClass
      let grades = args.grades
      if (grades.length < 1) {
        throw new UserInputError('At least one grade must be selected!')
      }



      if (args.title.length < 5) {
        throw new UserInputError('title too short')
      }

      let eventTags = JSON.parse(JSON.stringify(args.tags))

      const eventTagsNames = eventTags.map(e => e.name)
      let mongoTags = await Tag.find({ name: { $in: eventTagsNames } })
      const foundTagNames = mongoTags.map(t => t.name)
      eventTags.forEach(tag => {
        if (!foundTagNames.includes(tag.name)) {
          const newTag = new Tag({ name: tag.name })
          mongoTags = mongoTags.concat(newTag)
          tag = newTag.save()
        }
      })

      const extras = await Extra.find({ _id: { $in: args.extras } })

      const newEvent = new Event({
        title: args.title,
        start: args.start,
        end: args.end,
        desc: args.desc,
        resourceids,
        grades,
        remotePlatforms: args.remotePlatforms,
        otherRemotePlatformOption: args.otherRemotePlatformOption,
        remoteVisit: args.remoteVisit,
        inPersonVisit: args.inPersonVisit,
        waitingTime: args.waitingTime,
        availableTimes: [{
          startTime: args.start,
          endTime: args.end
        }],
        duration: args.duration
      })
      newEvent.extras = extras
      newEvent.tags = mongoTags
      await newEvent.save()
      return newEvent
    },
    createVisit: async (root, args, { currentUser }) => {
      const event = await Event.findById(args.event)
      const visitTime = {
        start: new Date(args.startTime),
        end: new Date(args.endTime)
      }
      const availableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))
      const eventTime = {
        start: new Date(event.start),
        end: new Date(event.end)
      }

      const availableTime = findValidTimeSlot(availableTimes, visitTime)
      if (!availableTime) {
        throw new UserInputError('Given timeslot is invalid')
      }

      if (
        visitTime.start >= eventTime.start &&
        visitTime.start < visitTime.end &&
        visitTime.end <= eventTime.end
      ) {
        const availableEnd = sub(new Date(visitTime.start), { minutes: event.waitingTime })
        const availableStart = add(new Date(visitTime.end), { minutes: event.waitingTime })

        const before = generateAvailableTime(availableTime.startTime, availableEnd)
        const after = generateAvailableTime(availableStart, availableTime.endTime)
        const newAvailableTimes = availableTimes.filter(at => at.endTime <= availableTime.startTime || at.startTime >= availableTime.endTime).map(at => Object({ startTime: at.startTime.toISOString(), endTime: at.endTime.toISOString() }))
        if (before) newAvailableTimes.push(before)
        if (after) newAvailableTimes.push(after)
        event.availableTimes = newAvailableTimes
      }

      const visit = new Visit({
        ...args,
        event: event,
        status: true,
        extras: []
      })
      const extras = await Extra.find({ _id: { $in: args.extras } })
      visit.extras = extras

      let savedVisit
      event.availableTimes = event.availableTimes.map(time => {
        if (typeof time.startTime === 'string') return time
        return {
          startTime: time.startTime.toISOString(),
          endTime: time.endTime.toISOString()
        }
      })
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
      const event = await Event.findById(visit.event)
      const visitTime = {
        start: sub(new Date(visit.startTime), { minutes: event.waitingTime }),
        end: add(new Date(visit.endTime), { minutes: event.waitingTime })
      }
      const eventTime = {
        start: new Date(event.start),
        end: new Date(event.end)
      }
      if (visitTime.end > eventTime.end) visitTime.end = eventTime.end
      if (visitTime.start < eventTime.start) visitTime.start = eventTime.start

      const availableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))

      const newAvailTime = findClosestTimeSlot(availableTimes, visitTime, eventTime)

      let filteredAvailTimes = availableTimes.filter(time => {
        return !(
          time.startTime >= newAvailTime.startTime &&
          time.endTime <= newAvailTime.endTime
        )
      })
      filteredAvailTimes.push(newAvailTime)
      filteredAvailTimes = filteredAvailTimes.map(time => {
        if (typeof time.startTime === 'string') return time
        return {
          startTime: time.startTime.toISOString(),
          endTime: time.endTime.toISOString()
        }
      })

      try {
        event.visits = event.visits.filter(v => v.toString() !== visit.id)
        event.availableTimes = filteredAvailTimes
        visit.status = false
        await visit.save()
        await event.save()
        return visit
      } catch (error) {
        event.visits = event.visits.concat(visit._id)
        event.availableTimes = availableTimes
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
    }
  }
}

module.exports = resolvers