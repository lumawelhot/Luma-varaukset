const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')

const { CREATE_VISIT, createTimeList, createAvailableList, createDate: time } = require('./testHelpers.js')

const Event = require('../models/event')
const Visit = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { details, eventData1, eventData2 } = require('./testData.js')

let availableEvent
let availableEvent2
let server

const visitResponse = async (event, start, end) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      ...details,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      token: 'token',
      customFormData: '[{"name": "customQuestion", "value": "answer"}]'
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
  await Event.deleteMany({})
  await Visit.deleteMany({})

  availableEvent = new Event(eventData1)
  availableEvent2 = new Event(eventData2)

  await availableEvent.save()
  await availableEvent2.save()
})

describe('Visit cannot be created', () => {

  it('if its starting time is too early', async () => {
    const event = availableEvent.id

    const response = await visitResponse(event, time(8, 59), time(10, 1))
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await Event.findById(event)

    expect(modifiedEvent.availableTimes.length).toBe(1)
    expect(modifiedEvent.visits.length).toBe(0)
  })

  it('if its ending time is too late', async () => {
    const event = availableEvent.id

    const response = await visitResponse(event, time(12, 0), time(15, 1))
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await Event.findById(event)

    expect(modifiedEvent.availableTimes.length).toBe(1)
    expect(modifiedEvent.visits.length).toBe(0)
  })

  it('if there is two time slots and visit is tried to create over them', async () => {
    const event = availableEvent2.id

    const response = await visitResponse(event, time(10, 59), time(13, 1))
    expect(response.errors[0].message).toBe('Given timeslot is invalid')
    const modifiedEvent = await Event.findById(event)

    expect(modifiedEvent.availableTimes.length).toBe(2)
    expect(modifiedEvent.visits.length).toBe(0)
  })
})

describe('Visit can be created', () => {
  it('if its timeslot is among with one of events available times', async () => {
    const event = availableEvent.id

    const response = await visitResponse(event, time(12, 0), time(12, 30))
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await Event.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [12, 50]], [[11, 40], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if visit\'s starting time is same as event\'s starting time', async () => {
    const event = availableEvent.id

    const response = await visitResponse(event, time(9, 0), time(12, 30))
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await Event.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)

    const timeList = createTimeList([[12, 50]], [[15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if visit\'s ending time is same as event\'s ending time', async () => {
    const event = availableEvent.id

    const response = await visitResponse(event, time(12, 0), time(15, 0))
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await Event.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(1)

    const timeList = createTimeList([[9, 0]], [[11, 40]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if there is a free time slot before another visit', async () => {
    const event = availableEvent2.id

    const response = await visitResponse(event, time(10, 30), time(10, 59))
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await Event.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [11, 14]], [[10, 15], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })

  it('if there is a free time slot after another visit', async () => {
    const event = availableEvent2.id

    const response = await visitResponse(event, time(13, 1), time(13, 30))
    expect(response.errors).toBeUndefined()
    const modifiedEvent = await Event.findById(event)
    expect(modifiedEvent.availableTimes.length).toBe(2)

    const timeList = createTimeList([[9, 0], [13, 45]], [[12, 46], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))
    const visitId = response.data.createVisit.id
    expect(modifiedEvent.visits[0].toString()).toEqual(visitId)
  })
})

afterAll(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
