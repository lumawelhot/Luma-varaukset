const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const Event = require('../models/event')
const User = require('../models/user')
const Visit = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { eventDetails1, details } = require('./testData')
const { add, sub } = require('date-fns')
const { FORCE_DELETE_EVENTS, CREATE_VISIT } = require('./testHelpers')

let server = null
let serverAdmin = null
let testEvent1
let testEvent2
let testEvent3
let testEvent4

const forceRemove = async (events, password, isAdmin) => {
  const { mutate } = isAdmin ? createTestClient(serverAdmin) : createTestClient(server)
  return await mutate({
    mutation: FORCE_DELETE_EVENTS,
    variables: {
      events,
      password
    }
  })
}

const visitResponse = async (event, start, end) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      ...details,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      token: 'token'
    },
  })
}

beforeAll(async () => {

  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  await User.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const adminPassword = await bcrypt.hash('password', 10)
  const adminData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }

  const user = new User(userData)
  const savedUser = await user.save()

  const admin = new User(adminData)
  const savedAdmin = await admin.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedUser
      return { currentUser }
    }
  })
  serverAdmin = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedAdmin
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  jest.setTimeout(60000)
  await Event.deleteMany({})
  await Visit.deleteMany({})
  const basicDetails = {
    tags: [],
    extras: [],
    availableTimes: {
      startTime: new Date(eventDetails1.start).toISOString(),
      endTime: new Date(eventDetails1.end).toISOString()
    },
  }

  const testData1 = {
    ...basicDetails,
    ...eventDetails1
  }
  const testData2 = {
    ...basicDetails,
    ...eventDetails1
  }

  const testData3 = {
    ...basicDetails,
    ...eventDetails1
  }
  const testData4 = {
    ...basicDetails,
    ...eventDetails1
  }

  testEvent1 = new Event(testData1)
  testEvent2 = new Event(testData2)
  testEvent3 = new Event(testData3)
  testEvent4 = new Event(testData4)

  await testEvent1.save()
  await testEvent2.save()
  await testEvent3.save()
  await testEvent4.save()

  const response1 = await visitResponse(testEvent1.id, new Date(testEvent1.start), add(new Date(testEvent1.start), { hours: 1 }))
  const response2 = await visitResponse(testEvent1.id, sub(new Date(testEvent1.end), { hours: 1 }), new Date(testEvent1.end))
  const response3 = await visitResponse(testEvent2.id, new Date(testEvent2.start), new Date(testEvent2.end))

  expect(response1.errors).toBeUndefined()
  expect(response2.errors).toBeUndefined()
  expect(response3.errors).toBeUndefined()
  const visits = await Visit.find({})
  expect(visits.length).toBe(3)
})

describe('Events', () => {

  it('can be force delete by admin with correct password', async () => {
    const response = await forceRemove([testEvent1.id, testEvent4.id], 'password', true)
    expect(response.errors).toBeUndefined()
    expect(response.data.forceDeleteEvents[0].id).toBe(testEvent1.id)
    expect(response.data.forceDeleteEvents[1].id).toBe(testEvent4.id)
    const visits = await Visit.find({})
    expect(visits.length).toBe(1)
  })

  it('cannot be force delete by admin with invalid password', async () => {
    const response = await forceRemove([testEvent1.id, testEvent4.id], 'invalid', true)
    expect(response.errors).toBeDefined()
    const visits = await Visit.find({})
    expect(visits.length).toBe(3)
  })

  it('cannot be force delete by employee with valid password', async () => {
    const response = await forceRemove([testEvent1.id, testEvent4.id], 'password', false)
    expect(response.errors).toBeDefined()
    const visits = await Visit.find({})
    expect(visits.length).toBe(3)
  })

})

afterAll(async () => {
  await Event.deleteMany({})
  await User.deleteMany({})
  await Visit.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})