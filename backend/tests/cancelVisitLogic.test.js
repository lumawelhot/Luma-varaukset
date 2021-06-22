const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')

const { CREATE_VISIT, details, createTimeList, createAvailableList, createDate, CANCEL_VISIT } = require('./testHelpers.js')

const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')


let availableEvent
let savedAvailableEvent
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

const cancelVisit = async (id) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CANCEL_VISIT,
    variables: { id }
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
    availableTimes: [{ startTime: availableStart, endTime: availableEnd }]
  }

  availableEvent = new EventModel(availableEventData)

  savedAvailableEvent = await availableEvent.save()
})

describe('Visit can be cancelled', () => {

  it('if its starting time is same as event\'s starting time', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(event, createDate(9, 0), createDate(10, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[10, 15]], [[15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if its ending time is same as event\'s ending time', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(event, createDate(12, 0), createDate(15, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 0]], [[11, 45]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if it is in the middle of the two available times', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(event, createDate(11, 0), createDate(13, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 0], [13, 15]], [[10, 45], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if it is after another visit', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(9, 30), createDate(10, 0))
    const { data } = await visitResponse(event, createDate(12, 0), createDate(13, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[10, 15], [13, 15]], [[11, 45], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[10, 15]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is before another visit', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(14, 0), createDate(14, 30))
    const { data } = await visitResponse(event, createDate(11, 0), createDate(12, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 0], [12, 15]], [[10, 45], [13, 45]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[13, 45]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is between two another visits', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(9, 30), createDate(9, 45))
    await visitResponse(event, createDate(13, 15), createDate(13, 30))
    const { data } = await visitResponse(event, createDate(11, 30), createDate(11, 45))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[10, 0],[12, 0] , [13, 45]], [[11, 15], [13, 0], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[10, 0], [13, 45]], [[13, 0], [15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(2)
  })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})
