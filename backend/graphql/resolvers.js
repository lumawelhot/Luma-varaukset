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
        grades
      })
      newEvent.tags = mongoTags
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
        const details = [{
          name: 'link',
          value: `http://localhost:3000/${savedVisit.id}`
        },
        {
          name: 'pin',
          value: savedVisit.pin
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