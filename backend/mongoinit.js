// Required script to initialize the database for the first time.
// Not intended to be used for other purposes.

const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const Email = require('./models/email')

const ADMIN_USERNAME = process.argv[2]
const ADMIN_PASSWORD = process.argv[3]

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
  console.log(`Initializing Luma-varaukset administrator: ${ ADMIN_USERNAME}`)
  mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset')
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
