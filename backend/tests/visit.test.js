const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')

const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { GET_ALL_VISITS, CREATE_VISIT, FIND_VISIT } = require('./testHelpers.js')
const { availableEventData, availableForLoggedInEventData, unvailableForLoggedInUserEventData, details } = require('./testData')

let availableEvent
let availableForLoggedInEvent
let unvailableForLoggedInUserEvent
let server
let user
let serverNoUser
let testVisit

const visitWithoutUser = async (event, start, end) => {
  const { mutate } = createTestClient(serverNoUser)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      grade: '13. grade',
      clientName: 'Teacher',
      schoolName: 'School',
      schoolLocation: 'ivalo',
      participants: 13,
      clientEmail: 'ivalonkoulu@school.com',
      clientPhone: '040-7654321',
      inPersonVisit: true,
      remoteVisit: false,
      dataUseAgreement: true,
      token: 'token',
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      customFormData: JSON.stringify([{ name: 'question1', value: 'answer2' }])
    }
  })
}

const visitWithUser = async (event, start, end) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      grade: '31. grade',
      clientName: 'Admin',
      schoolName: 'University',
      schoolLocation: 'helsinki',
      participants: 13,
      clientEmail: 'university@school.com',
      clientPhone: '040-3131313',
      inPersonVisit: false,
      remoteVisit: true,
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
      dataUseAgreement: true,
      token: 'token',
      customFormData: JSON.stringify([{ name: 'question1', value: 'answer2' }])
    }
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

  user = new User(userData)
  await user.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = user
      return { currentUser }
    }
  })

  serverNoUser = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = undefined
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})

  availableEvent = new Event(availableEventData)
  availableForLoggedInEvent = new Event(availableForLoggedInEventData)
  unvailableForLoggedInUserEvent = new Event(unvailableForLoggedInUserEventData)

  await availableEvent.save()
  await availableForLoggedInEvent.save()
  await unvailableForLoggedInUserEvent.save()

  const testVisitData = {
    ...details,
    event: availableEvent,
    status: true,
    startTime: availableEvent.start.toISOString(),
    endTime: availableEvent.end.toISOString(),
    reserved: 'token',
    customFormData: JSON.stringify([{ name: 'question1', value: 'answer2' }])
  }

  testVisit = new Visit(testVisitData)
  await testVisit.save()
})

describe('Visit model test. Visit', () => {

  it('is successfully saved with valid information', async () => {
    const newVisitData = {
      event: availableEvent,
      ...details,
      startTime: availableEvent.start,
      endTime: availableEvent.end,
      reserved: 'token',
      status: true
    }
    const validVisit = new Visit(newVisitData)
    const savedVisit = await validVisit.save()

    expect(savedVisit._id).toBeDefined()
  })

  it('is not saved if any information missing', async () => {
    const invalidVisit = new Visit()
    let error
    try {
      await invalidVisit.save()
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(error.errors.event).toBeDefined()
    expect(error.errors.grade).toBeDefined()
    expect(error.errors.clientName).toBeDefined()
    expect(error.errors.schoolName).toBeDefined()
    expect(error.errors.schoolLocation).toBeDefined()
    expect(error.errors.participants).toBeDefined()
    expect(error.errors.clientEmail).toBeDefined()
    expect(error.errors.clientPhone).toBeDefined()
    expect(error.errors.dataUseAgreement).toBeDefined()

  })
})

describe('Visit server test. Visit', () => {

  it('can be booked by anonymous user', async () => {
    const event = availableEvent
    const visit = await visitWithoutUser(event.id, event.start, event.end)

    const { createVisit } = visit.data

    expect(createVisit.id).toBeDefined()
    expect(createVisit.event.title).toBe(event.title)
    expect(createVisit.clientName).toBe('Teacher')
    expect(createVisit.schoolName).toBe('School')
    expect(createVisit.schoolLocation).toBe('ivalo')
    expect(createVisit.participants).toBe(13)
    expect(createVisit.clientEmail).toBe('ivalonkoulu@school.com')
    expect(createVisit.clientPhone).toBe('040-7654321')
    expect(createVisit.grade).toBe('13. grade')
    expect(createVisit.status).toBe(true)
    expect(createVisit.dataUseAgreement).toBe(true)
  })

  it('cannot be booked by anonymous user for less than two weeks ahead', async () => {
    const event = availableForLoggedInEvent
    const visit = await visitWithoutUser(event.id, event.start, event.end)

    const { createVisit } = visit.data
    expect(createVisit).toBe(null)
  })

  it('can be booked by logged in user for more than one hour ahead', async () => {
    const event = availableForLoggedInEvent
    const visit = await visitWithUser(event.id, event.start, event.end)

    const { createVisit } = visit.data

    expect(createVisit.id).toBeDefined()
    expect(createVisit.event.title).toBe(availableForLoggedInEvent.title)
    expect(createVisit.grade).toBe('31. grade')
    expect(createVisit.clientName).toBe('Admin')
    expect(createVisit.schoolName).toBe('University')
    expect(createVisit.schoolLocation).toBe('helsinki')
    expect(createVisit.participants).toBe(13)
    expect(createVisit.clientEmail).toBe('university@school.com')
    expect(createVisit.clientPhone).toBe('040-3131313')
    expect(createVisit.status).toBe(true)
    expect(createVisit.dataUseAgreement).toBe(true)
  })

  it('cannot be booked by logged in user for less than one hour ahead', async () => {
    const event = unvailableForLoggedInUserEvent
    const visit = await visitWithUser(event.id, event.start, event.end)

    const { createVisit } = visit.data

    expect(createVisit).toBe(null)
  })

})

describe('Visit', () => {

  it('can be find by id', async () => {
    const { query } = createTestClient(server)
    const id = testVisit.id
    const { data } = await query({
      query: FIND_VISIT,
      variables: { id }
    })

    const { findVisit } = data

    expect(findVisit.event.id).toBe(testVisit.event.id)
    expect(findVisit.grade).toBe(testVisit.grade)
    expect(findVisit.clientName).toBe(testVisit.clientName)
    expect(findVisit.schoolName).toBe(testVisit.schoolName)
    expect(findVisit.schoolLocation).toBe(testVisit.schoolLocation)
    expect(findVisit.participants).toBe(testVisit.participants)
    expect(findVisit.clientEmail).toBe(testVisit.clientEmail)
    expect(findVisit.clientPhone).toBe(testVisit.clientPhone)
    expect(findVisit.dataUseAgreement).toBe(testVisit.dataUseAgreement)
  })

  it('can be cancelled by id', async () => {
    const { mutate } = createTestClient(server)
    const id = testVisit.id
    const CANCEL_VISIT = gql`
    mutation cancelVisit($id: ID!) {
      cancelVisit(id: $id) {
        id
        status
      }
    }
    `
    const { data } = await mutate({
      mutation: CANCEL_VISIT,
      variables: { id }
    })
    const { cancelVisit } = data
    expect(cancelVisit.id).toBe(testVisit.id)
    expect(cancelVisit.status).toBe(false)
    const cancelledVisit = await Visit.findById(testVisit.id)
    expect(cancelledVisit.id).toBeDefined()

    const event = await Event.findById(cancelledVisit.event)
    expect(event.visits.length).toBe(0)
  })

})

describe('Visits', () => {

  it('are given to logged in users', async () => {
    const { query } = createTestClient(server)
    const { data } = await query({
      query: GET_ALL_VISITS
    })
    const { getVisits } = data
    expect(getVisits.length).toBe(1)
    expect(getVisits[0].clientName).toBe('Teacher')
  })

  it('aren\'t given to anonymous user', async () => {
    const { query } = createTestClient(serverNoUser)
    const { data } = await query({
      query: GET_ALL_VISITS
    })
    const { getVisits } = data
    expect(getVisits.length).toBe(0)
  })
})

afterAll(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
