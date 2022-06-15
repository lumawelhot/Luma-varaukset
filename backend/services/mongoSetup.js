const bcrypt = require('bcrypt')
const Event = require('../models/event')
const User = require('../models/user')
const Tag = require('../models/tag')
const mongoose = require('mongoose')

const createAdmin = async () => {
  await User.deleteMany({})
  const userObject = new User({
    username: 'Admin',
    passwordHash: await bcrypt.hash('salainen', 10),
    isAdmin: true,
  })
  await userObject.save()
}
const createEmployee = async () => {
  const userObject = new User({
    username: 'Employee',
    passwordHash: await bcrypt.hash('emp', 10),
    isAdmin: false,
  })
  await userObject.save()
}

const createTags = async () => {
  await Tag.deleteMany({})
  const tag1 = new Tag({
    name: 'Matematiikka'
  })
  const tag2 = new Tag({
    name: 'Fysiikka'
  })
  const tag3 = new Tag({
    name: 'Maantiede'
  })

  await tag1.save()
  await tag2.save()
  await tag3.save()
}

const unlockEvents = async () => {
  const events = await Event.find({})
  for (let event of events) {
    event.reserved = null
    await event.save()
  }
  console.log('event reservations unlocked')
}

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ) {
  const { importStaticEvents }  = require('../utils/importStaticData')
  const { MongoMemoryServer } = require('mongodb-memory-server')
  const mongoServer = new MongoMemoryServer()
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoServer.getUri().then(uri => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(async () => {
        console.log('connected to MongoDB memory server, initializing database')
        await createAdmin()
        await createEmployee()
        await createTags()
        await importStaticEvents()
        //await createExtras()
      })
      .catch((error) => {
        console.log('error connecting to MongoDB: ', error.message)
      })
  })
  /* const { resetDbForE2E } = require('./utils/mongoinit')
  app.get('/reset', async (req, res) => {
    await resetDbForE2E()
    res.json({ message: 'Database reset for E2E tests' })
  }) */ // ---> Deprecated, no e2e tests currently
} else if (process.env.NODE_ENV === 'production') { // production mode
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB')
      unlockEvents()
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB: ', error.message)
    })
} else {
  /* const { importStaticEvents }  = require('./utils/importStaticData') */
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)
  mongoose.connect('mongodb://localhost:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('connected to MongoDB')
      unlockEvents()
    })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'MongoDB connection error:'))
  /* const { resetDbForE2E } = require('./utils/mongoinit')
  app.get('/reset', async (req, res) => {
    await resetDbForE2E()
    await createAdmin()
    await createEmployee()
    await createTags()
    await importStaticEvents()
    res.json({ message: 'Database reset for E2E tests' })
  }) */ // ---> Deprecated, no e2e tests currently
}