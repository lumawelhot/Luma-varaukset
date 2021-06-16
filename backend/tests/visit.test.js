const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')

const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let availableEvent
let unavailableEvent
let savedAvailableEvent
let savedUnavailableEvent
let savedTestVisit
let server

beforeAll(async () => {

  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })

  server = new ApolloServer({
    typeDefs,
    resolvers,
  })
})

beforeEach(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})

  const availableDate = new Date()
  availableDate.setDate(new Date().getDate() + 16) // varmistetaan, että testitapahtuma on yli kahden viikon päässä
  const unavailableDate = new Date()

  const unavailableEventData = {
    title: 'All About Algebra',
    resourceId: 1,
    grades: [1],
    start: unavailableDate,
    end: unavailableDate,
    inPersonVisit: true,
    remoteVisit: false
  }

  const availableEventData = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    grades: [1],
    start: availableDate,
    end: availableDate,
    inPersonVisit: false,
    remoteVisit: true
  }

  unavailableEvent = new EventModel(unavailableEventData)
  availableEvent = new EventModel(availableEventData)

  savedUnavailableEvent = await unavailableEvent.save()
  savedAvailableEvent = await availableEvent.save()

  const testVisitData = {
    event: availableEvent,
    grade: 1,
    clientName: 'Teacher',
    clientEmail: 'teacher@school.com',
    clientPhone: '040-1234567',
    status: true
  }

  const testVisit = new VisitModel(testVisitData)
  savedTestVisit = await testVisit.save()
})

describe('Visit Model Test', () => {

  it('teacher can create new visit successfully', async () => {
    const newVisitData = {
      event: availableEvent,
      grade: 1,
      clientName: 'Teacher 2',
      clientEmail: 'teacher2@someschool.com',
      clientPhone: '050-8912345',
      status: true
    }
    const validVisit = new VisitModel(newVisitData)
    const savedVisit = await validVisit.save()
    expect(savedVisit._id).toBeDefined()
    expect(savedVisit.event).toBe(newVisitData.event)
    expect(savedVisit.grade).toBe(newVisitData.grade)
    expect(savedVisit.clientName).toBe(newVisitData.clientName)
    expect(savedVisit.clientEmail).toBe(newVisitData.clientEmail)
    expect(savedVisit.clientPhone).toBe(newVisitData.clientPhone)
    expect(savedVisit.status).toBe(true)
  })

  it('teacher cannot create visit without required field', async () => {
    const visitWithoutRequiredField = new VisitModel()
    let err
    try {
      await visitWithoutRequiredField.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.event).toBeDefined()
    expect(err.errors.grade).toBeDefined()
    expect(err.errors.clientName).toBeDefined()
    expect(err.errors.clientEmail).toBeDefined()
    expect(err.errors.clientPhone).toBeDefined()
  })
})

describe('Visit server test', () => {

  it('create visit successfully', async () => {
    const { mutate } = createTestClient(server)
    const event = savedAvailableEvent.id
    const CREATE_VISIT = gql`
      mutation createVisit($event: ID!, $clientName: String!, $clientEmail: String!, $clientPhone: String!, $grade: Int!) {
        createVisit(
          event: $event
          clientName: $clientName
          clientEmail: $clientEmail
          clientPhone: $clientPhone
          grade: $grade
        ) {
          id
          event {
            title
            booked
          }
          clientName
          clientEmail
          clientPhone
          grade
          status
        }
      }
      `
    const  { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { event: event, clientName: 'Teacher', clientEmail: 'teacher@school.com', clientPhone: '040-1234567', grade: 1 }
    })

    const { createVisit }  = data

    expect(createVisit.id).toBeDefined()
    expect(createVisit.event.title).toBe(savedAvailableEvent.title)
    expect(createVisit.clientName).toBe('Teacher')
    expect(createVisit.clientEmail).toBe('teacher@school.com')
    expect(createVisit.clientPhone).toBe('040-1234567')
    expect(createVisit.grade).toBe(1)
    expect(createVisit.event.booked).toBe(true)
    expect(createVisit.status).toBe(true)
  })

  it('cannot create visit for event less than two weeks ahead', async () => {
    const { mutate } = createTestClient(server)
    const event = savedUnavailableEvent.id
    const CREATE_VISIT = gql`
      mutation createVisit($event: ID!, $clientName: String!, $clientEmail: String!, $clientPhone: String!, $grade: Int!) {
        createVisit(
          event: $event
          clientName: $clientName
          clientEmail: $clientEmail
          clientPhone: $clientPhone
          grade: $grade
        ) {
          id
          event {
            title
          }
          clientName
          clientEmail
          clientPhone
          grade
        }
      }
      `
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: { event: event, clientName: 'Teacher', clientEmail: 'teacher@school.com', clientPhone: '040-1234567', grade: 1 }
    })

    const { createVisit }  = data

    expect(createVisit).toBe(null)
  })

  it('find by visit id', async () => {
    const { query } = createTestClient(server)
    const id = savedTestVisit.id
    const FIND_VISIT = gql`
        query findVisit($id: ID!) {
          findVisit(id: $id) {
            id
            event {
              id
            }
            clientName
            clientEmail
            clientPhone
            grade
          }
        }
        `
    const { data }  = await query({
      query: FIND_VISIT,
      variables: { id }
    })

    const { findVisit } = data

    expect(findVisit.event.id).toBe(savedTestVisit.event.id)
    expect(findVisit.grade).toBe(savedTestVisit.grade)
    expect(findVisit.clientName).toBe(savedTestVisit.clientName)
    expect(findVisit.clientEmail).toBe(savedTestVisit.clientEmail)
    expect(findVisit.clientPhone).toBe(savedTestVisit.clientPhone)
  })

  it('cancel visit by id', async () => {
    const { mutate } = createTestClient(server)
    const id = savedTestVisit.id
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
    expect(cancelVisit.id).toBe(savedTestVisit.id)
    expect(cancelVisit.status).toBe(false)

    const cancelledVisit = await VisitModel.findById(savedTestVisit.id)
    expect(cancelledVisit.id).toBeDefined()

    const event = await EventModel.findById(cancelledVisit.event)
    expect(event.booked).toBe(false)
  })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
