const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const jwt = require('jsonwebtoken')
const Tag = require('../models/tag')
const moment = require ('moment')
const mailer = require('../services/mailer')
const config = require('../utils/config')
const { readMessage } = require('../services/fileReader')

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async () => {
      const events = await Event.find({}).populate('tags', { name: 1, id: 1 })
      return events
    },
    getTags: async () => {
      const tags = await Tag.find({})
      return tags
    },
    getVisits: async () => {
      const visits = await Visit.find({}).populate('event', { id: 1, title: 1, resourceId: 1 })
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
          clientEmail: visit.clientEmail,
          clientPhone: visit.clientPhone,
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
    createEvent: async (root, args, { currentUser } ) => {
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
        booked: false,
        remoteVisit: args.remoteVisit,
        inPersonVisit: args.inPersonVisit
      })
      newEvent.tags = mongoTags
      await newEvent.save()
      return newEvent
    },
    createVisit: async (root, args) => {
      const event = await Event.findById(args.event)
      event.booked = true
      await event.save()
      const visit = new Visit({
        ...args,
        event: event,
        status: true,
      })
      let savedVisit
      try {
        const now = moment(new Date())
        const start = moment(event.start)
        const startsAfter14Days = start.diff(now, 'days') >= 14
        const startsWithin1Hour = start.diff(now, 'hours') > 0
        const user = await User.findOne({ username: args.username })
        const eventCanBeBooked = (user == null) ? startsAfter14Days : startsWithin1Hour
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
          return savedVisit
        }
      } catch (error) {
        event.booked = false
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
      try {
        visit.status = false
        event.booked = false
        await visit.save()
        await event.save()
        return visit
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
  }
}

module.exports = resolvers