const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const jwt = require('jsonwebtoken')
const Tag = require('../models/tag')
const mailer = require('../services/mailer')
const config = require('../utils/config')
const { readMessage } = require('../services/fileReader')
const { getUnixTime, add, sub } = require('date-fns')
const { findValidTimeSlot, findClosestTimeSlot } = require('../utils/timeCalculation')

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async () => {
      const events = await Event.find({}).populate('tags', { name: 1, id: 1 }).populate('visits', { startTime: 1, endTime: 1 })
      console.log(events.map(event => event.availableTimes))
      return events
    },
    getTags: async () => {
      const tags = await Tag.find({})
      return tags
    },
    getVisits: async () => {
      const visits = await Visit.find({}).populate('event', { id: 1, title: 1, resourceId: 1, remoteVisit: 1, inPersonVisit : 1 })
      return visits
    },
    findVisit: async (root, args) => {
      try {
        const visit = await Visit.findById(args.id)
        return {
          id: visit.id,
          event: visit.event,
          grade: visit.grade,
          clientName: visit.clientName,
          schoolName: visit.schoolName,
          schoolLocation: visit.schoolLocation,
          participants: visit.participants,
          inPersonVisit: visit.inPersonVisit,
          remoteVisit: visit.remoteVisit,
          clientEmail: visit.clientEmail,
          clientPhone: visit.clientPhone,
          startTime: visit.startTime,
          endTime: visit.endTime,
          status: visit.status
        }
      } catch (e) {
        throw new UserInputError('Varausta ei löytynyt!')
      }
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event).populate('tags', { name: 1, id: 1 })
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
      let resourceId = null
      switch (args.class) {
        case 'SUMMAMUTIKKA':
          resourceId = 1
          break
        case 'FOTONI':
          resourceId = 2
          break
        case 'LINKKI':
          resourceId = 3
          break
        case 'GEOPISTE':
          resourceId = 4
          break
        case 'GADOLIN':
          resourceId = 5
          break
        default:
          throw new UserInputError('Invalid class')
      }

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

      const newEvent = new Event({
        title: args.title,
        start: args.start,
        end: args.end,
        desc: args.desc,
        resourceId,
        grades,
        remoteVisit: args.remoteVisit,
        inPersonVisit: args.inPersonVisit,
        availableTimes: [{ startTime: args.start, endTime: args.end }]
      })
      newEvent.tags = mongoTags
      await newEvent.save()
      return newEvent
    },
    createVisit: async (root, args) => {
      const event = await Event.findById(args.event)
      const visitTime = {
        start: new Date(args.startTime),
        end: new Date(args.endTime)
      }
      const availableTimes = event.availableTimes.map(time => ({
        startTime: new Date(time.startTime),
        endTime: new Date(time.endTime)
      }))

      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      const generateAvailableTime = (start, end) => {
        let result = null
        if (end - start >= 3600000) {
          result = {
            startTime: start,
            endTime: end
          }
        }
        return result
      }
      const assignAvailableTimes = (after, before, availableTime) => {
        const filteredAvailTimes = availableTimes.filter(at => at.endTime <= availableTime.startTime || at.startTime >= availableTime.endTime).map(at => Object({ startTime: at.startTime.toISOString(), endTime: at.endTime.toISOString() }))
        if (before) filteredAvailTimes.push(before)
        if (after) filteredAvailTimes.push(after)
        return filteredAvailTimes
      }

      const availableTime = findValidTimeSlot(availableTimes, visitTime)
      if (!availableTime) {
        throw new UserInputError('Given timeslot is invalid')
      }

      if (
        getUnixTime(visitTime.start) >= getUnixTime(eventStart) &&
        getUnixTime(visitTime.start) < getUnixTime(visitTime.end) &&
        getUnixTime(visitTime.end) <= getUnixTime(eventEnd)
      ) {
        const availableEnd = new Date(visitTime.start)
        const availableStart = new Date(visitTime.end)
        availableEnd.setTime(availableEnd.getTime() - 900000)
        availableStart.setTime(availableStart.getTime() + 900000)

        const availableBefore = generateAvailableTime(availableTime.startTime, availableEnd)
        const availableAfter = generateAvailableTime(availableStart, availableTime.endTime)
        const newAvailableTimes = assignAvailableTimes(availableAfter, availableBefore, availableTime)
        event.availableTimes = newAvailableTimes
      }

      const visit = new Visit({
        ...args,
        event: event,
        status: true,
        startTime: args.startTime,
        endTime: args.endTime,
      })

      let savedVisit
      try {
        const now = new Date()
        const start = new Date(event.start)
        const user = await User.findOne({ username: args.username })
        const startsAfter14Days = getUnixTime(start) - getUnixTime(now) >= 1209600
        const startsAfter1Hour = getUnixTime(start) - getUnixTime(now) >= 3600
        const eventCanBeBooked = (user === null) ? startsAfter14Days : startsAfter1Hour
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
      const event = await Event.findById(visit.event)
      const visitTime = {
        start: sub(new Date(visit.startTime), { minutes: 15 }),
        end: add(new Date(visit.endTime), { minutes: 15 })
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

      const filteredAvailTimes = availableTimes.filter(time => !(
        getUnixTime(time.startTime) === getUnixTime(newAvailTime.startTime) ||
        getUnixTime(time.endTime) === getUnixTime(newAvailTime.endTime)
      ))
      filteredAvailTimes.push(newAvailTime)

      try {
        event.visits = event.visits.filter(v => v.toString() !== visit.id) //huomaa catch!
        event.availableTimes = filteredAvailTimes
        visit.status = false
        event.booked = false
        await visit.save()
        await event.save()
        return visit
      } catch (error) {
        event.availableTimes = availableTimes
        await event.save()
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
  }
}

module.exports = resolvers