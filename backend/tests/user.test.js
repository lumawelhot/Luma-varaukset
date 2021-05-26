const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)

const { MongoMemoryServer } = require('mongodb-memory-server')
const mock_user = { username: 'testuser', passwordHash: 'password', isAdmin: false }

beforeEach(async () => {
  await User.deleteMany({})
})

/* beforeAll(async () => {
    const mongoServer = new MongoMemoryServer()
    mongoServer.getUri().then(uri => {
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('connected to test-mongodb')
    })
    await User.deleteMany({})
}) */

describe('Test User model', () => {

  test('create new user', async () => {
    const valid_user = new User(mock_user)
    const saved_user = await valid_user.save()

    expect(saved_user.username).toBe(mock_user.username)
    expect(saved_user.passwordHash).toBe(mock_user.passwordHash)
    expect(saved_user.isAdmin).toBe(mock_user.isAdmin)
  })

  test('create user without required field', async () => {
    const userWithoutRequiredField = new User({ passwordHash: 'password', isAdmin: false })
    let validationError
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save()
    } catch (error) {
      validationError = error
    }
    expect(validationError).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(validationError.errors.username).toBeDefined()
  })
})

afterAll(done => {
  mongoose.connection.close()
  console.log('Mongo<db connection closed.')
  done()
})