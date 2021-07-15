const mongoose = require('mongoose')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const Event = require('../models/event')
const User = require('../models/user')
const Extra = require('../models/extra')
const Tag = require('../models/tag')

const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

const { createTestClient } = require('apollo-server-testing')
const { CREATE_VISIT, CREATE_EVENT, UPDATE_EVENT, createDate } = require('./testHelpers')
const { details } = require('./testData')
const { set, addDays, add, sub } = require('date-fns')

let server = null
let extra1
let extra2
let extra3
let event

const testData = {
  title: 'All About Algebra',
  scienceClass: [1],
  grades: [1, 2],
  desc: 'Algebra is one of the broad areas of mathematics, together with number theory, geometry and analysis.',
  start: addDays(set(new Date(), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }), 16).toISOString(),
  end: addDays(set(new Date(), { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 }), 16).toISOString(),
  tags: [{ name: 'Matematiikka' }, { name: 'Fysiikka' }],
  booked: false,
  inPersonVisit: true,
  remoteVisit: false,
  waitingTime: 10,
  duration: 20,
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
  await Event.deleteMany({})
  await Tag.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  extra1 = new Extra({ name: 'Kampuskierros', classes: [1, 2, 3, 4], remoteLength: 5, inPersonLength: 15 })
  extra2 = new Extra({ name: 'Opiskelijan elämää', remoteLength: 15, inPersonLength: 20, classes: [2, 3, 4] })
  extra3 = new Extra({ name: 'Opiskelijan aamupala', remoteLength: 25, inPersonLength: 30, classes: [1, 3] })
  await extra1.save()
  await extra2.save()
  await extra3.save()

  const user = new User(userData)
  const savedUser = await user.save()
  expect(savedUser.isAdmin).toBe(user.isAdmin)

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

  const { mutate } = createTestClient(server)
  const response = await mutate({
    mutation: CREATE_EVENT,
    variables: { ...testData, extras: [extra1.id, extra2.id] }
  })
  event = response.data.createEvent
})

describe('Event modification test', () => {
  it('most of event fields can be modified', async () => {
    const { mutate } = createTestClient(server)

    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        title: 'Hello world',
        desc: 'This is test',
        scienceClass: [3, 4],
        grades: [1, 3],
        inPersonVisit: false,
        remoteVisit: true,
        extras: [],
        tags: []
      }
    })
    const { data } = response
    const { modifyEvent } = data

    expect(modifyEvent.title).toBe('Hello world')
    expect(modifyEvent.grades).toEqual([1, 3])
    expect(modifyEvent.desc).toBe('This is test')
    expect(modifyEvent.resourceids).toEqual([3, 4])
    expect(modifyEvent.inPersonVisit).toBe(false)
    expect(modifyEvent.remoteVisit).toBe(true)
    expect(response.errors).toBeUndefined()
  })

  it('tags can be modified', async () => {
    const { mutate } = createTestClient(server)
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        tags: [{
          name: 'Matematiikka'
        }, {
          name: 'Tira'
        }]
      }
    })
    const { data } = response
    const { modifyEvent } = data

    expect(modifyEvent.title).toBe('All About Algebra')
    expect(modifyEvent.resourceids).toEqual([1])
    expect(modifyEvent.inPersonVisit).toBe(true)
    expect(modifyEvent.remoteVisit).toBe(false)
    expect(modifyEvent.tags[0].name).toEqual('Matematiikka')
    expect(modifyEvent.tags[1].name).toEqual('Tira')
    expect(response.errors).toBeUndefined()
  })

  it('extras can be modified', async () => {
    const { mutate } = createTestClient(server)
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        extras: [extra3.id],
        tags: []
      }
    })
    const { data } = response
    const { modifyEvent } = data

    expect(modifyEvent.extras).toEqual([{
      name: extra3.name,
      inPersonLength: extra3.inPersonLength,
      remoteLength: extra3.remoteLength,
      id: extra3.id
    }])
    expect(response.errors).toBeUndefined()
  })
})

describe('The event has no visits, then', () => {
  it('the timeslot changes correctly if start time is given', async () => {
    const { mutate } = createTestClient(server)
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        start: add(new Date(testData.start), { hours: 1 }).toISOString(),
        tags: []
      }
    })
    const { data } = response
    const { modifyEvent } = data

    expect(modifyEvent.start).toEqual(add(new Date(testData.start), { hours: 1 }).toISOString())
    expect(response.errors).toBeUndefined()
  })

  it('the timeslot changes correctly if end time is given', async () => {
    const { mutate } = createTestClient(server)
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        end: sub(new Date(testData.end), { hours: 1, minutes: 13 }).toISOString(),
        tags: []
      }
    })
    const { data } = response
    const { modifyEvent } = data

    expect(modifyEvent.end).toEqual(sub(new Date(testData.end), { hours: 1, minutes: 13 }).toISOString())
    expect(modifyEvent.availableTimes).toEqual([{
      startTime: new Date(testData.start).toISOString(),
      endTime: sub(new Date(testData.end), { hours: 1, minutes: 13 }).toISOString()
    }])
    expect(response.errors).toBeUndefined()
  })
})

describe('Event has one visit, then', () => {
  it('the timeslot changes correctly', async () => {
    const { mutate } = createTestClient(server)
    await visitResponse(event.id, createDate(11, 0), createDate(12, 0))
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        start: set(new Date(testData.start), { hours: 9, minutes: 13 }).toISOString(),
        end: set(new Date(testData.end), { hours: 14, minutes: 31 }).toISOString(),
        tags: []
      }
    })
    const modifyEvent = response.data.modifyEvent

    const expectedAvailableTimes = [{
      startTime: createDate(9, 13).toISOString(),
      endTime: createDate(10, 50).toISOString()
    }, {
      startTime: createDate(12, 10).toISOString(),
      endTime: createDate(14, 31).toISOString(),
    }]

    expect(modifyEvent.start).toEqual(createDate(9, 13).toISOString())
    expect(modifyEvent.end).toEqual(createDate(14, 31).toISOString())
    expect(modifyEvent.availableTimes).toEqual(expectedAvailableTimes)
    expect(response.errors).toBeUndefined()
  })

  it('error is shown if start time is invalid', async () => {
    const { mutate } = createTestClient(server)
    await visitResponse(event.id, createDate(11, 0), createDate(12, 0))
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        start: set(new Date(testData.start), { hours: 11, minutes: 1 }).toISOString(),
        end: set(new Date(testData.end), { hours: 14, minutes: 31 }).toISOString(),
        tags: []
      }
    })
    expect(response.errors[0].message).toEqual('invalid start or end')
  })

  it('error is shown if end time is invalid', async () => {
    const { mutate } = createTestClient(server)
    await visitResponse(event.id, createDate(11, 0), createDate(12, 0))
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        start: set(new Date(testData.start), { hours: 9, minutes: 13 }).toISOString(),
        end: set(new Date(testData.end), { hours: 11, minutes: 59 }).toISOString(),
        tags: []
      }
    })
    expect(response.errors[0].message).toEqual('invalid start or end')
  })

  it('if events\' timeslot is visits\' timeslot then there are no available times', async () => {
    const { mutate } = createTestClient(server)
    await visitResponse(event.id, createDate(11, 0), createDate(12, 0))
    const response = await mutate({
      mutation: UPDATE_EVENT,
      variables: {
        event: event.id,
        start: set(new Date(testData.start), { hours: 11, minutes: 0 }).toISOString(),
        end: set(new Date(testData.end), { hours: 12, minutes: 0 }).toISOString(),
        tags: []
      }
    })
    const modifyEvent = response.data.modifyEvent
    expect(modifyEvent.start).toEqual(createDate(11, 0).toISOString())
    expect(modifyEvent.end).toEqual(createDate(12, 0).toISOString())
    expect(modifyEvent.availableTimes).toEqual([])
  })
})

afterAll(async () => {
  await Event.deleteMany({})
  await User.deleteMany({})
  await Extra.deleteMany({})
  await Tag.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})