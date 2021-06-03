const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const jwt = require('jsonwebtoken')

const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await User.find({})
      return users
    },
    getEvents: async () => {
      const events = await Event.find({})
      return events
    },
    findVisit: async (root, args) => {
      const visit = await Visit.findById(args.id)
      return visit
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Visit: {
    event: async (root) => {
      const event = await Event.findById(root.event)
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
      return { value: jwt.sign(userForToken, 'huippusalainen') }
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
      const newEvent = new Event({
        title: args.title,
        start: args.start,
        end: args.end,
        desc: args.desc,
        resourceId,
        grades
      })
      await newEvent.save()
      return newEvent
    },
    createVisit: async (root, args) => {
      const pin = Math.floor(1000 + Math.random() * 9000)
      const event = await Event.findById(args.event)
      const visit = new Visit({
        ...args,
        event: event,
        pin: pin,
      })
      try {
        const savedVisit = await visit.save()
        return savedVisit
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    cancelVisit: async (root, args) => {
      const visit = await Visit.findById(args.id)
      if (visit.pin === args.pin) {
        try {
          return Visit.findByIdAndRemove(visit.id)
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      } else {
        throw new UserInputError('Wrong pin!')
      }

    },
  }
}

module.exports = resolvers