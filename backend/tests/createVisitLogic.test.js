const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')

const { CREATE_VISIT, details, createTimeList, createAvailableList, createDate } = require('./testHelpers.js')

const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')


let availableEvent
let availableEvent2
let savedAvailableEvent
let savedEventWithVisit
let server

const visitResponse = async (event, start, end) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      ...details,
      startTime: start.toString(),
      endTime: end.toString()
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

  server = new ApolloServer({
    typeDefs,
    resolvers,
  })
})

beforeEach(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})

  const availableStart = createDate(9, 0)
  const availableEnd = createDate(15, 0)

  const availableEventData = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    grades: [1],
    start: availableStart,
    end: availableEnd,
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: availableStart, endTime: availableEnd }],
    waitingTime: 20
  }

  const start1 = createDate(9, 0)
  const start2 = createDate(13, 0)
  const end1 = createDate(11, 0)
  const end2 = createDate(15, 0)

  const eventWithVisit = {
    title: 'Two times!',
    resourceId: 2,
    grades: [1],
    start: availableStart,
    end: availableEnd,
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: start1, endTime: end1 }, { startTime: start2, endTime: end2 }],
    waitingTime: 15
  }

  availableEvent = new EventModel(availableEventData)
  availableEvent2 = new EventModel(eventWithVisit)

  savedAvailableEvent = await availableEvent.save()
  savedEventWithVisit = await availableEvent2.save()
})

describe('Visit cannot be created', () => {

  it('if its starting time is too early', async () => {
    const event = savedAvailableEvent.id

    const startTooEarly = createDate(8, 59)
    const end = createDate(10, 1)
    const response = await visitResponse(event, startTooEarly, end)
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)

    expect(modifiedEvent.availableTimes.length).toBe(1)
    expect(modifiedEvent.visits.length).toBe(0)
  })

  it('if its ending time is too late', async () => {
    const event = savedAvailableEvent.id
    const start = createDate(12, 0)
    const endTooLate = createDate(15, 1)
    const response = await visitResponse(event, start, endTooLate)
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)
    expect(modifiedEvent.visits.length).toBe(0)
  })

  it('if there is two time slots and visit is tried to create over them', async () => {
    const event = savedEventWithVisit.id
    const start = createDate(10, 59)
    const end = createDate(13, 1)
    const response = await visitResponse(event, start, end)
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    expect(modifiedEvent.visits.length).toBe(0)
  })
})

describe('Visit can be created', () => {
  it('if its timeslot is among with one of events available times', async () => {
    const event = savedAvailableEvent.id
    const start = createDate(12, 0)
    const end = createDate(12, 30)

    const response = await visitResponse(event, start, end)
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [12, 50]], [[11, 40], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if visit\'s starting time is same as event\'s starting time', async () => {
    const event = savedAvailableEvent.id
    const start = createDate(9, 0)
    const end = createDate(12, 30)

    const response = await visitResponse(event, start, end)
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)

    const timeList = createTimeList([[12, 50]], [[15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if visit\'s ending time is same as event\'s ending time', async () => {
    const event = savedAvailableEvent.id
    const start = createDate(12, 0)
    const end = createDate(15, 0)

    const response = await visitResponse(event, start, end)
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)

    const timeList = createTimeList([[9, 0]], [[11, 40]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if there is a free time slot before another visit', async () => {
    const event = savedEventWithVisit.id
    const start = createDate(10, 30)
    const end = createDate(10, 59)

    const response = await visitResponse(event, start, end)
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [13, 0]], [[10, 15], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if there is a free time slot after another visit', async () => {
    const event = savedEventWithVisit.id
    const start = createDate(13, 1)
    const end = createDate(13, 30)

    const response = await visitResponse(event, start, end)
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await EventModel.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [13, 45]], [[11, 0], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
