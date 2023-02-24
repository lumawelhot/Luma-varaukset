/* eslint-disable no-console */
const mongoose = require('mongoose')
const { initializeDB } = require('./services/dbsetup')
mongoose.set('strictQuery', true)

mongoose.connect('mongodb://localhost:27017')
  .then(async () => {
    console.log('Connected to MongoDB')
    await initializeDB()
    console.log('MongoDB initialized')
    mongoose.connection.close()
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB: ', error.message)
    mongoose.connection.close()
  })
