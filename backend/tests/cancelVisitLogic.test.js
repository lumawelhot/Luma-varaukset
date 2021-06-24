const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')

const {
  CREATE_VISIT,
  details,
  createTimeList,
  createAvailableList,
  createDate,
  CANCEL_VISIT,
} = require('./testHelpers.js')

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
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  })
}

const cancelVisit = async (id) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CANCEL_VISIT,
    variables: { id },
  })
}

beforeAll(async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
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
    start: availableStart.toISOString(),
    end: availableEnd.toISOString(),
    inPersonVisit: false,
    remoteVisit: true,
    availableTimes: [{ startTime: availableStart, endTime: availableEnd }],
    waitingTime: 10,
    duration: 60,
    extras: []
  }

  availableEvent = new EventModel(availableEventData)

  savedAvailableEvent = await availableEvent.save()
})

describe('Cancelling a visit results in correct availableTimes', () => {
  it('if its starting time is the same as the event\'s starting time', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(
      event,
      createDate(9, 0),
      createDate(10, 0)
    )
    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[10, 10]], [[15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(
      eventAfterCancellation.availableTimes
    )
    expect(timeListAfterCancellation).toEqual(
      expect.arrayContaining(availableListAfter)
    )
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if its ending time is the same as the event\'s ending time', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(
      event,
      createDate(12, 0),
      createDate(15, 0)
    )

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 0]], [[11, 50]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(
      eventAfterCancellation.availableTimes
    )
    expect(timeListAfterCancellation).toEqual(
      expect.arrayContaining(availableListAfter)
    )
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if it\'s between the two available times', async () => {
    const event = savedAvailableEvent.id
    const { data } = await visitResponse(
      event,
      createDate(11, 0),
      createDate(13, 0)
    )

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList(
      [
        [9, 0],
        [13, 10],
      ],
      [
        [10, 50],
        [15, 0],
      ]
    )
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(
      eventAfterCancellation.availableTimes
    )
    expect(timeListAfterCancellation).toEqual(
      expect.arrayContaining(availableListAfter)
    )
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if it is after another visit', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(9, 30), createDate(10, 0))
    const { data } = await visitResponse(
      event,
      createDate(12, 0),
      createDate(13, 0)
    )

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList(
      [
        [10, 10],
        [13, 10],
      ],
      [
        [11, 50],
        [15, 0],
      ]
    )
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[10, 10]], [[15, 0]])
    const availableListAfter = createAvailableList(
      eventAfterCancellation.availableTimes
    )

    expect(timeListAfterCancellation).toEqual(
      expect.arrayContaining(availableListAfter)
    )
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is before another visit', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(14, 0), createDate(14, 30))
    const { data } = await visitResponse(event, createDate(11, 0), createDate(12, 0))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 0], [12, 10]], [[10, 50], [13, 50]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[13, 50]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is between two other visits', async () => {
    const event = savedAvailableEvent.id
    await visitResponse(event, createDate(9, 30), createDate(9, 45))
    await visitResponse(event, createDate(13, 15), createDate(13, 30))
    const { data } = await visitResponse(event, createDate(11, 30), createDate(11, 45))

    const modifiedEvent = await EventModel.findById(event)
    const timeList = createTimeList([[9, 55],[11, 55] , [13, 40]], [[11, 20], [13, 5], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await EventModel.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 55], [13, 40]], [[13, 5], [15, 0]])
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
