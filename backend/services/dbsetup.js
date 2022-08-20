const bcrypt = require('bcrypt')
const { Event, User, Tag, Extra, Email } = require('../db')
const mongoose = require('mongoose')
const { addBusinessDays, set } = require('date-fns')

const createEvent = async event => {
  const randomHours = Math.floor(Math.random() * 5)
  const randomDays = Math.floor(Math.random() * 10)
  const start = addBusinessDays(set(new Date(), { hours: 8 + randomHours, minutes: 0, seconds: 0, milliseconds: 0 }), 10 + randomDays).toISOString()
  const end = addBusinessDays(set(new Date(), { hours: 10 + randomHours, minutes: 0, seconds: 0, milliseconds: 0 }), 10 + randomDays).toISOString()
  Event.insert({
    ...event,
    start,
    end,
    availableTimes: [{ startTime: start, endTime: end }],
    tags: await Tag.Insert(event.tags)
  })
}

const initializeDB = async () => {
  const users = require('./staticdata/users.json')
  const extras = require('./staticdata/extras.json')
  const emails = require('./staticdata/emails.json')
  const events = require('./staticdata/events.json')
  await Promise.all(users.map(async user => User.insert({
    ...user,
    passwordHash: await bcrypt.hash(user.password, 10)
  }))
    .concat(extras.map(e => Extra.insert(e)))
    .concat(emails.map(e => Email.insert(e)))
    .concat(events.map(event => createEvent(event)))
    .concat(events.map(event => createEvent(event))))
}

const unlockEvents = async () => {
  const events = await Event.find()
  await Promise.all(events.map(e => Event.update(e.id, { reserved: null })))
  console.log('event reservations unlocked')
}

if (process.env.NODE_ENV === 'development' ) { // dev mode
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongoServer = new MongoMemoryServer()
  mongoServer.getUri().then(uri => {
    mongoose.connect(uri)
      .then(async () => {
        console.log('connected to MongoDB memory server, initializing database')
        await initializeDB()
      })
      .catch((error) => {
        console.log('error connecting to MongoDB: ', error.message)
      })
  })
} else if (process.env.NODE_ENV !== 'test') {
  const uri = process.env.NODE_ENV === 'production'
    ? 'mongodb://luma-varaukset-db:27017/luma-varaukset' // production mode
    : 'mongodb://localhost:27017' // docker dev
  mongoose.connect(uri)
    .then(() => {
      console.log('Connected to MongoDB')
      unlockEvents()
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB: ', error.message)
    })
}

module.exports = {
  initializeDB
}
