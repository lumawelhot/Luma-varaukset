const { UserInputError, AuthenticationError } = require('apollo-server-errors')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Event = require('../models/event')
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
    me: (root, args, context) => {
      return context.currentUser
    }
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
      if ( !(user && passwordCorrect) ) {
        throw new UserInputError('Wrong credentials!')
      }

      const userForToken = { username: user.username, id: user._id }
      return { value: jwt.sign(userForToken, "huippusalainen") }
    },
    createEvent: async (root, args, { currentUser }) =>{
      if (!currentUser) {
        throw new AuthenticationError('no credentials')
      }
      let resourceId = null
      switch(args.class) {
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
      const newEvent = new Event({
        title: args.title,
        start: args.start,
        end: args.end,
        resourceId
      })
      await newEvent.save()
      return newEvent
    }
  }
}

module.exports = resolvers