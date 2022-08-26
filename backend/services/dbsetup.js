/* eslint-disable no-magic-numbers */
const bcrypt = require('bcrypt')
const { Event, User, Tag, Extra, Email, Visit, Group, Form } = require('../db')
const mongoose = require('mongoose')
const { addBusinessDays, set } = require('date-fns')
const logger = require('../logger')

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
  const groups = require('./staticdata/groups.json')
  const forms = require('./staticdata/forms.json')
  await Promise.all(users.map(async user => User.insert({
    ...user,
    passwordHash: await bcrypt.hash(user.password, 10)
  }))
    .concat(extras.map(e => Extra.insert(e)))
    .concat(emails.map(e => Email.insert(e)))
    .concat(events.map(event => createEvent(event)))
    .concat(events.map(event => createEvent(event)))
    .concat(groups.map(group => Group.Insert(group)))
    .concat(forms.map(f => ({ ...f, fields: JSON.parse(f.fields) })).map(form => Form.insert(form))))
  const booked = await Event.find({ title: 'Booked' })
  const extra1 = await Extra.find({ name: 'Opiskelijan elämää' })
  const extra2 = await Extra.find({ name: 'Tieteenalan esittely' })
  await Promise.all(booked.map(event => Visit.insert({
    event: event.id,
    clientEmail: 'ivalo.opettaja@alppilankoulu.fi',
    clientName: 'Ivalon Opettaja',
    clientPhone: '050 123456789',
    customFormData: null,
    extras: [],
    grade: '2nd grade',
    inPersonVisit: true,
    language: 'fi',
    participants: 13,
    remotePlatform: null,
    remoteVisit: false,
    schoolLocation: 'Ivalo',
    schoolName: 'Ivalon koulu',
    status: true,
    dataUseAgreement: false,
    startTime: new Date(event.start),
    endTime: new Date(event.end)
  })))
  const visits = await Visit.find({ clientName: 'Ivalon Opettaja' })
  await Event.update(booked[0].id, {
    extras: [extra1[0], extra2[0]],
    visits: visits,
    title: 'Booked extras'
  })
}

const unlockEvents = async () => {
  const events = await Event.find()
  await Promise.all(events.map(e => Event.update(e.id, { reserved: null })))
  logger.info('Event reservations unlocked')
}

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'e2e') { // dev mode
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongoServer = new MongoMemoryServer()
  mongoServer.getUri().then(uri => {
    mongoose.connect(uri)
      .then(async () => {
        logger.info('Connected to MongoDB memory server, initializing database')
        await initializeDB()
        logger.info('Database initialized')
      })
      .catch((error) => {
        logger.critical('Error connecting to MongoDB: ', error.message)
      })
  })
} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'docker') {
  const uri = process.env.NODE_ENV === 'production'
    ? 'mongodb://luma-varaukset-db:27017/luma-varaukset' // production mode
    : 'mongodb://localhost:27017' // docker dev
  mongoose.connect(uri)
    .then(() => {
      logger.info('Connected to MongoDB')
      unlockEvents()
    })
    .catch((error) => {
      logger.critical('Error connecting to MongoDB: ', error.message)
    })
}

module.exports = {
  initializeDB
}
