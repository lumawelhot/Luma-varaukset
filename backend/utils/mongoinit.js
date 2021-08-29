const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user')
const Event = require('../models/event')
const Extra = require('../models/extra')
const Visit = require('../models/visit')
const Form = require('../models/forms')
const Email = require('../models/email')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

var ADMIN_USERNAME = process.argv[2]
var ADMIN_PASSWORD = process.argv[3]

const createEmailTemplates = async () => {
  await Email.deleteMany({})
  const cancellation = new Email({
    name: 'cancellation',
    text: 'null',
    html: '<h1>null</h1>',
    subject: 'Cancellation',
    adSubject: 'Cancellation',
    ad: [],
    adText: 'null'
  })
  const thanks = new Email({
    name: 'thanks',
    text: 'null',
    html: '<h1>null</h1>',
    subject: 'Thanks',
    adSubject: 'Thanks',
    ad: [],
    adText: 'null'
  })
  const reminder = new Email({
    name: 'reminder',
    text: 'text',
    html: '<h1>html</h1>',
    subject: 'Reminder',
    adSubject: 'Reminder',
    ad: [],
    adText: 'text'
  })
  const welcome = new Email({
    name: 'welcome',
    text: '/link/r',
    html: '<h1>/link/r</h1>',
    subject: 'Welcome',
    adSubject: 'Welcome',
    ad: [],
    adText: 'null'
  })
  await thanks.save()
  await reminder.save()
  await welcome.save()
  await cancellation.save()
}

const createAdmin = async () => {
  await User.deleteMany({})
  const userObject = new User({
    username: ADMIN_USERNAME,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    isAdmin: true,
  })
  await userObject.save()
}

if (ADMIN_USERNAME && ADMIN_PASSWORD ) {
  console.log('Initializing Luma-varaukset administrator: ' + ADMIN_USERNAME)
  mongoose.connect('mongodb://localhost:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      createEmailTemplates().then(() => {
        createAdmin().then(() => {
          mongoose.disconnect()
          console.log('Done.')
        })
      })
    })
    .catch((error) => {
      console.log('Error connecting to MongoDB: ', error.message)
    })
}

const resetDbForE2E = async () => {
  await Visit.deleteMany({})
  await Extra.deleteMany({})
  await Event.deleteMany({})
  await Form.deleteMany({})
  console.log('Database reset!')
}

module.exports = { resetDbForE2E }