const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { initializeDB } = require('../../services/dbsetup')

let mongoServer
beforeEach(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = await mongoServer.getUri()
  await mongoose.connect(mongoUri)
  await initializeDB()
})

afterEach(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('Access interface', () => {

  require('./common.test')
  require('./transaction.test')

})
