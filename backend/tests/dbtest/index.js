const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { initializeDB } = require('../../services/dbsetup')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

let mongoServer
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = await mongoServer.getUri()
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  await initializeDB()
})

afterEach(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Access interface', () => {

  require('./common.test')

})