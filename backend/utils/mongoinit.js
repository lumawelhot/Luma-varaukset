const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

var ADMIN_USERNAME = process.argv[2]
var ADMIN_PASSWORD = process.argv[3]

const createAdmin = async () => {
  await User.deleteMany({})
  const userObject = new User({
    username: ADMIN_USERNAME,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    isAdmin: true,
  })
  await userObject.save()
}

console.log('Initializing Luma-varaukset administrator: ' + ADMIN_USERNAME)
mongoose.connect('mongodb://luma-varaukset-db:27017/luma-varaukset', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    createAdmin().then(() => {
      mongoose.disconnect()
      console.log('Done.')
    })
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB: ', error.message)
  })
