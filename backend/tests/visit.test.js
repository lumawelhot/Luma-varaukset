const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
var setHours = require('date-fns/setHours')
var setMinutes = require('date-fns/setMinutes')
var setSeconds = require('date-fns/setSeconds')
var add = require('date-fns/add')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { CREATE_VISIT, FIND_VISIT, LOGIN } = require('./testHelpers.js')

let availableEvent
let unavailableEvent
let availableForLoggedInEvent
let unvailableForLoggedInUserEvent
let savedAvailableEvent
let savedUnavailableEvent
let savedAvailableForLoggedInEvent
let savedUnvailableForLoggedInUserEvent
let savedTestVisit
let server
let basicUserData

beforeAll(async () => {

  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })

  await UserModel.deleteMany({})
  const basicPassword = await bcrypt.hash('basic-password', 10)
  basicUserData = { username: 'basic', passwordHash: basicPassword, isAdmin: false }

  const basicUser = new UserModel(basicUserData)
  await basicUser.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
  })
})

beforeEach(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})

  const availableDate = setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 9), 0), 0)
  const fiveHoursAdded = setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 14), 0), 0)

  const unavailableDate = new Date()

  const availableForLoggedInDate = new Date()
  availableForLoggedInDate.setDate(new Date().getDate() + 2)
  const twoHoursAddedForLoggedIn = add(new Date(), { days: 2, hours: 2 })

  const unavailableForLoggedInDate = new Date()
  unavailableForLoggedInDate.setDate(new Date().getDate() - 2)

  const unavailableEventData = {
    title: 'All About Algebra',
    resourceids: [1],
    grades: [1],
    start: unavailableDate,
    end: unavailableDate,
    inPersonVisit: true,
    remoteVisit: false,
    waitingTime: 15,
    availableTimes: []
  }

  const availableEventData = {
    title: 'Up-And-Atom!',
    resourceids: [2],
    grades: [1],
    start: availableDate,
    end: fiveHoursAdded,
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: availableDate, endTime: fiveHoursAdded }],
    waitingTime: 15
  }

  const availableForLoggedInEventData = {
    title: 'Last minute event!',
    resourceId: 1,
    grades: [1],
    start: availableForLoggedInDate,
    end: twoHoursAddedForLoggedIn,
    inPersonVisit: true,
    remoteVisit: false,
    availableTimes: [{ startTime: availableForLoggedInDate, endTime: twoHoursAddedForLoggedIn }],
    waitingTime: 15
  }

  const unvailableForLoggedInUserEventData = {
    title: 'Past event',
    resourceId: 1,
    grades: [1],
    start: unavailableForLoggedInDate,
    end: unavailableForLoggedInDate,
    inPersonVisit: true,
    remoteVisit: false,
    availableTimes: [],
    waitingTime: 15
  }

  unavailableEvent = new EventModel(unavailableEventData)
  availableEvent = new EventModel(availableEventData)
  availableForLoggedInEvent = new EventModel(availableForLoggedInEventData)
  unvailableForLoggedInUserEvent = new EventModel(unvailableForLoggedInUserEventData)

  savedUnavailableEvent = await unavailableEvent.save()
  savedAvailableEvent = await availableEvent.save()
  savedAvailableForLoggedInEvent = await availableForLoggedInEvent.save()
  savedUnvailableForLoggedInUserEvent = await unvailableForLoggedInUserEvent.save()

  const testVisitData = {
    event: availableEvent,
    grade: '1. grade',
    clientName: 'Teacher',
    schoolName: 'School',
    schoolLocation: 'Location',
    participants: 13,
    clientEmail: 'teacher@school.com',
    clientPhone: '040-1234567',
    inPersonVisit: true,
    remoteVisit: false,
    status: true,
    startTime: availableEvent.start,
    endTime: availableEvent.end
  }

  const testVisit = new VisitModel(testVisitData)
  savedTestVisit = await testVisit.save()
})

describe('Visit Model Test', () => {

  it('teacher can create new visit successfully', async () => {
    const newVisitData = {
      event: availableEvent,
      grade: '1. grade',
      clientName: 'Teacher 2',
      schoolName: 'School 2',
      schoolLocation: 'Location 2',
      participants: 15,
      clientEmail: 'teacher2@someschool.com',
      clientPhone: '050-8912345',
      inPersonVisit: true,
      remoteVisit: true,
      status: true,
      startTime: availableEvent.start,
      endTime: availableEvent.end
    }
    const validVisit = new VisitModel(newVisitData)
    const savedVisit = await validVisit.save()

    expect(savedVisit._id).toBeDefined()
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
    expect(err.errors.schoolName).toBeDefined()
    expect(err.errors.schoolLocation).toBeDefined()
    expect(err.errors.participants).toBeDefined()
    expect(err.errors.clientEmail).toBeDefined()
    expect(err.errors.clientPhone).toBeDefined()
  })
})

describe('Visit server test', () => {

  it('Create visit successfully', async () => {
    const { mutate } = createTestClient(server)
    const event = savedAvailableEvent
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event.id,
        grade: '1. grade',
        clientName: 'Teacher',
        schoolName: 'School',
        schoolLocation: 'Location',
        participants: 13,
        clientEmail: 'teacher@school.com',
        clientPhone: '040-1234567',
        inPersonVisit: true,
        remoteVisit: false,
        startTime: event.start,
        endTime: event.end
      }
    })

    const { createVisit } = data

    expect(createVisit.id).toBeDefined()
    expect(createVisit.event.title).toBe(savedAvailableEvent.title)
    expect(createVisit.grade).toBe('1. grade')
    expect(createVisit.clientName).toBe('Teacher')
    expect(createVisit.schoolName).toBe('School')
    expect(createVisit.schoolLocation).toBe('Location')
    expect(createVisit.participants).toBe(13)
    expect(createVisit.clientEmail).toBe('teacher@school.com')
    expect(createVisit.clientPhone).toBe('040-1234567')
    expect(createVisit.grade).toBe('1. grade')
    expect(createVisit.participants).toBe(13)
    expect(createVisit.status).toBe(true)
  })

  it('cannot create visit for event less than two weeks ahead', async () => {
    const { mutate } = createTestClient(server)
    const event = savedUnavailableEvent
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event.id,
        grade: '1. grade',
        clientName: 'Teacher',
        schoolName: 'School',
        schoolLocation: 'Location',
        participants: 13,
        clientEmail: 'teacher@school.com',
        clientPhone: '040-1234567',
        startTime: event.start,
        endTime: event.end,
        inPersonVisit: true,
        remoteVisit: false
      }
    })
    const { createVisit } = data

    expect(createVisit).toBe(null)
  })

  it('logged in user can create visit any event ahead', async () => {
    const { mutate } = createTestClient(server)

    // Login
    let response = await mutate({ mutation: LOGIN })
    expect(response.errors).toBeUndefined()

    // create event
    const event = savedAvailableForLoggedInEvent
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event.id,
        grade: '1. grade',
        clientName: 'Teacher',
        schoolName: 'School',
        schoolLocation: 'Location',
        participants: 13,
        clientEmail: 'teacher@school.com',
        clientPhone: '040-1234567',
        inPersonVisit: true,
        remoteVisit: false,
        startTime: event.start,
        endTime: event.end
      }
    })
    const { createVisit } = data

    expect(createVisit).toBe(null)
  })

  it('logged in user can create visit any event ahead', async () => {
    const { mutate } = createTestClient(server)

    // Login
    let response = await mutate({ mutation: LOGIN })
    expect(response.errors).toBeUndefined()

    // create event
    const event = savedAvailableForLoggedInEvent
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event.id,
        grade: '1. grade',
        clientName: 'Teacher',
        schoolName: 'School',
        schoolLocation: 'Location',
        participants: 17,
        clientEmail: 'teacher@school.com',
        clientPhone: '040-1234567',
        username: basicUserData.username,
        startTime: event.start,
        endTime: event.end,
        inPersonVisit: true,
        remoteVisit: false
      }
    })
    const { createVisit } = data

    expect(createVisit.id).toBeDefined()
    expect(createVisit.event.title).toBe(savedAvailableForLoggedInEvent.title)
    expect(createVisit.grade).toBe('1. grade')
    expect(createVisit.clientName).toBe('Teacher')
    expect(createVisit.schoolName).toBe('School')
    expect(createVisit.schoolLocation).toBe('Location')
    expect(createVisit.participants).toBe(17)
    expect(createVisit.clientEmail).toBe('teacher@school.com')
    expect(createVisit.clientPhone).toBe('040-1234567')
    expect(createVisit.status).toBe(true)
  })

  it('logged in user can\'t create visit to any event before now', async () => {
    const { mutate } = createTestClient(server)

    // Login
    let response = await mutate({ mutation: LOGIN })
    expect(response.errors).toBeUndefined()

    // create event
    const event = savedUnvailableForLoggedInUserEvent
    const { data } = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event.id,
        grade: '1. grade',
        clientName: 'Teacher',
        schoolName: 'School',
        schoolLocation: 'Location',
        participants: 17,
        clientEmail: 'teacher@school.com',
        clientPhone: '040-1234567',
        username: basicUserData.username,
        startTime: event.start,
        endTime: event.end,
        inPersonVisit: true,
        remoteVisit: false
      }
    })
    const { createVisit } = data

    expect(createVisit).toBe(null)
  })

  it('Find visit by id', async () => {
    const { query } = createTestClient(server)
    const id = savedTestVisit.id
    const { data } = await query({
      query: FIND_VISIT,
      variables: { id }
    })

    const { findVisit } = data

    expect(findVisit.event.id).toBe(savedTestVisit.event.id)
    expect(findVisit.grade).toBe(savedTestVisit.grade)
    expect(findVisit.clientName).toBe(savedTestVisit.clientName)
    expect(findVisit.schoolName).toBe(savedTestVisit.schoolName)
    expect(findVisit.schoolLocation).toBe(savedTestVisit.schoolLocation)
    expect(findVisit.participants).toBe(savedTestVisit.participants)
    expect(findVisit.clientEmail).toBe(savedTestVisit.clientEmail)
    expect(findVisit.clientPhone).toBe(savedTestVisit.clientPhone)
  })

  it('Cancel visit by id', async () => {
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
    expect(event.visits.length).toBe(0)
  })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
