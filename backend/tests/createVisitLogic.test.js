const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
//const moment = require ('moment')
//const parseISO = require('date-fns/parseISO')
var setHours = require('date-fns/setHours')
var setMinutes = require('date-fns/setMinutes')
var setSeconds = require('date-fns/setSeconds')
var add = require('date-fns/add')
//const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz')

const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let availableEvent
let availableEvent2
let savedAvailableEvent
let savedEventWithVisit
//let savedUnavailableEvent
let server

const CREATE_VISIT = gql `
  mutation createVisit($event: ID!, $clientName: String!, $clientEmail: String!, $clientPhone: String!, $grade: Int!, $startTime: String!, $endTime: String!) {
    createVisit(
      event: $event
      clientName: $clientName
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      grade: $grade
      startTime: $startTime
      endTime: $endTime
    ) {
      id
      event {
        title
      }
      clientName
      clientEmail
      clientPhone
      grade
      status
    }
  }
`

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: 1,
}

const createDate = (minutes, hours) => setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), hours), minutes), 0)

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

  const availableStart = createDate(0, 9) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 9), 0), 0)
  const availableEnd = createDate(0, 15) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 15), 0), 0)

  const availableEventData = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    grades: [1],
    start: availableStart,
    end: availableEnd,
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: availableStart, endTime: availableEnd }]
  }

  const start1 = createDate(0, 9) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 9), 0), 0)
  const start2 = createDate(0, 11) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 11), 0), 0)
  const end1 = createDate(0, 13) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 13), 0), 0)
  const end2 = createDate(0, 15) //setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 15), 0), 0)

  const eventWithVisit = {
    title: 'Two times!',
    resourceId: 2,
    grades: [1],
    start: availableStart,
    end: availableEnd,
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: start1, endTime: end1 }, { startTime: start2, endTime: end2 }]
  }

  availableEvent = new EventModel(availableEventData)
  availableEvent2 = new EventModel(eventWithVisit)

  savedAvailableEvent = await availableEvent.save()
  savedEventWithVisit = await availableEvent2.save()
})

describe('Visit cannot be created', () => {

  it('if its starting time is too early', async () => {
    const { mutate } = createTestClient(server)
    const event = savedAvailableEvent.id

    const startTooEarly = createDate(59, 8)
    const end = createDate(0, 10)
    const response = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event,
        ...details,
        startTime: startTooEarly.toString(),
        endTime: end.toString()
      }
    })
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)
  })

  it('if its ending time is too late', async () => {
    const { mutate } = createTestClient(server)
    const event = savedAvailableEvent.id
    const startTooEarly = createDate(0, 12)
    const end = createDate(1, 15)
    const response = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event,
        ...details,
        startTime: startTooEarly.toString(),
        endTime: end.toString()
      }
    })
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)
  })

  it('if there is two time slots and visit is tried to create over them', async () => {
    const { mutate } = createTestClient(server)
    const event = savedEventWithVisit.id
    const start = createDate(59, 10)
    const end = createDate(1, 13)
    const response = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event,
        ...details,
        startTime: start.toString(),
        endTime: end.toString()
      }
    })
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)
  })
})

describe('Visit can be created', () => {
  it('if its timeslot is among with one of events available times', async () => {
    const { mutate } = createTestClient(server)
    const event = savedAvailableEvent.id

    const start = createDate(0, 12)//setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 12), 0), 0)
    const end = createDate(30, 12)//setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), 12), 30), 0)
    const response = await mutate({
      mutation: CREATE_VISIT,
      variables: {
        event: event,
        ...details,
        startTime: start.toString(),
        endTime: end.toString()
      }
    })
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    console.log(modifiedEvent.availableTimes)
    expect(modifiedEvent.availableTimes.length).toBe(2)
  })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
