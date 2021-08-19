const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const {
  CREATE_VISIT,
  createTimeList,
  createAvailableList,
  createDate16DaysInFuture: time,
  CANCEL_VISIT,
} = require('./testHelpers.js')

const User = require('../models/user')
const Event = require('../models/event')
const Visit = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { details, eventData3, eventData4 } = require('./testData.js')

let availableEvent
let sixtyMinutesEvent
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
      token: 'token'
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
  await User.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const user = new User(userData)
  const savedUser = await user.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedUser
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  await Event.deleteMany({})
  await Visit.deleteMany({})

  availableEvent = new Event(eventData3)
  sixtyMinutesEvent = new Event(eventData4)

  await sixtyMinutesEvent.save()
  await availableEvent.save()
})

describe('Cancelling a visit results in correct availableTimes', () => {
  it('if its starting time is the same as the event\'s starting time', async () => {
    const event = availableEvent.id
    const { data } = await visitResponse(event, time('09:00'), time('10:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[10, 10]], [[15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)

    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if its ending time is the same as the event\'s ending time', async () => {
    const event = availableEvent.id
    const { data } = await visitResponse(event, time('12:00'), time('15:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0]], [[11, 50]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
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
    const event = availableEvent.id
    const { data } = await visitResponse(event, time('11:00'), time('13:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0], [13, 10]], [[10, 50], [15, 0]])

    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[15, 0]])
    const availableListAfter = createAvailableList(
      eventAfterCancellation.availableTimes
    )
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(0)
  })

  it('if it is after another visit', async () => {
    const event = availableEvent.id
    await visitResponse(event, time('09:30'), time('10:00'))
    const { data } = await visitResponse(event, time('12:00'), time('13:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[10, 10], [13, 10]], [[11, 50], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[10, 10]], [[15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)

    expect(timeListAfterCancellation).toEqual(
      expect.arrayContaining(availableListAfter)
    )
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is before another visit', async () => {
    const event = availableEvent.id
    await visitResponse(event, time('14:00'), time('14:30'))
    const { data } = await visitResponse(event, time('11:00'), time('12:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0], [12, 10]], [[10, 50], [13, 50]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0]], [[13, 50]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if it is between two other visits', async () => {
    const event = availableEvent.id
    await visitResponse(event, time('09:30'), time('09:45'))
    await visitResponse(event, time('13:15'), time('13:30'))
    const { data } = await visitResponse(event, time('11:30'), time('11:45'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 55],[11, 55] , [13, 40]], [[11, 20], [13, 5], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 55], [13, 40]], [[13, 5], [15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(2)
  })

  it('if two visits are close to each other', async () => {
    const event = availableEvent.id
    const { data } = await visitResponse(event, time('11:30'), time('11:45'))
    await visitResponse(event, time('11:55'), time('12:30'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0], [12, 40]], [[11, 20], [15, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0], [12, 40]], [[11, 45], [15, 0]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(1)
  })

  it('if a revocable visit is close to two another visits', async () => {
    const event = availableEvent.id
    await visitResponse(event, time('11:30'), time('11:45'))
    const { data } = await visitResponse(event, time('11:55'), time('12:30'))
    await visitResponse(event, time('12:55'), time('15:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0]], [[11, 20]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0], [11, 55]], [[11, 20], [12, 45]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(2)
  })

  it('if a revocable visit is close to two another visits and removed visit timeslot difference is events\' duration', async () => {
    const event = availableEvent.id
    await visitResponse(event, time('13:10'), time('13:40'))
    const { data } = await visitResponse(event, time('13:50'), time('14:20'))
    await visitResponse(event, time('14:30'), time('15:00'))

    const modifiedEvent = await Event.findById(event).populate('visits', { startTime: 1, endTime: 1 })
    const timeList = createTimeList([[9, 0]], [[13, 0]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))
    expect(modifiedEvent.visits.length).toEqual(3)

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0], [13, 50]], [[13, 0], [14, 20]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(2)
  })

  it('if a revocable visit is close to two another visits and removed visit timeslot difference is events\' duration', async () => {
    const event = sixtyMinutesEvent.id
    await visitResponse(event, time('11:30'), time('12:30'))
    const { data } = await visitResponse(event, time('12:45'), time('13:45'))
    await visitResponse(event, time('14:00'), time('15:00'))

    const modifiedEvent = await Event.findById(event)
    const timeList = createTimeList([[9, 0]], [[11, 15]])
    const availableList = createAvailableList(modifiedEvent.availableTimes)
    expect(timeList).toEqual(expect.arrayContaining(availableList))
    expect(modifiedEvent.visits.length).toEqual(3)

    const response = await cancelVisit(data.createVisit.id)
    expect(response.errors).toBeUndefined()
    const eventAfterCancellation = await Event.findById(event)
    const timeListAfterCancellation = createTimeList([[9, 0], [12, 45]], [[11, 15], [13, 45]])
    const availableListAfter = createAvailableList(eventAfterCancellation.availableTimes)
    expect(timeListAfterCancellation).toEqual(expect.arrayContaining(availableListAfter))
    expect(eventAfterCancellation.visits.length).toEqual(2)
  })
})

/*

All cases

___S******E------------------------------|___
___|-----------------------------S*******E___
___|--------------S*******E--------------|___
___|_S____E-------S*******E--------------|___
___|--------------S*******E------S_____E_|___
___|_S____E-------S*******E------S_____E_|___
___|-----S*******E__S______E-------------|___
___|-----S_______E__S******E__S__________|___
___|--------------------S____ES****ES____E___
___|-------------------------------------|___
___|-------------------------------------|___
___|-------------------------------------|___
___|-------------------------------------|___
___|-------------------------------------|___

*/