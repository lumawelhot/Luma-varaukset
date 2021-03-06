const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const Event = require('../models/event')
const User = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { availableEventData, details } = require('./testData')
const { CREATE_VISIT, UPDATE_EVENT, LOCK_EVENT, UNLOCK_EVENT, createDate16DaysInFuture:time } = require('./testHelpers')

let server
let eventWithReservation
let eventWithoutReservation

const visitResponse = async (event, token) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: CREATE_VISIT,
    variables: {
      event,
      ...details,
      startTime: time('09:00').toISOString(),
      endTime: time('14:00').toISOString(),
      token
    },
  })
}

const modifyResponse = async (event) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: UPDATE_EVENT,
    variables: {
      event,
      title: 'modified',
      tags: []
    },
  })
}

const lockEventResponse = async (event) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: LOCK_EVENT,
    variables: { event }
  })
}

const unlockEventResponse = async (event) => {
  const { mutate } = createTestClient(server)
  return await mutate({
    mutation: UNLOCK_EVENT,
    variables: { event }
  })
}

beforeAll(async () => {
  await User.deleteMany({})
  await Event.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const user = new User(userData)
  await user.save()

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = user
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  const eventWithReservationData = {
    tags: [],
    extras: [],
    ...availableEventData,
    reserved: 'token'
  }
  const eventWithoutReservationData = {
    tags: [],
    extras: [],
    ...availableEventData
  }
  eventWithReservation = new Event(eventWithReservationData)
  eventWithoutReservation = new Event(eventWithoutReservationData)
  await eventWithReservation.save()
  await eventWithoutReservation.save()
})

describe('Event with reservation', () => {

  it('can be booked with valid token', async () => {
    const response = await visitResponse(eventWithReservation.id, 'token')
    expect(response.errors).toBeUndefined()
    expect(response.data.createVisit.clientName).toBe('Teacher')
  })

  it('cannot be booked with invalid token', async () => {
    const response = await visitResponse(eventWithReservation.id, 'invalid')
    expect(response.errors[0].message).toBe('Invalid session')
    expect(response.data.createVisit).toBeNull()
  })

  it('cannot be modified', async () => {
    const response = await modifyResponse(eventWithReservation.id)
    expect(response.errors[0].message).toBe('Event cannot be modified because booking form is open')
    expect(response.data.modifyEvent).toBeNull()
  })

  it('cannot be reserved', async () => {
    const response = await lockEventResponse(eventWithReservation.id)
    expect(response.errors[0].message).toBe('Older session is already active')
    expect(response.data.lockEvent).toBeNull()
  })

  it('can be booked if reservation is cancelled', async () => {
    const unlock = await unlockEventResponse(eventWithReservation.id)
    expect(unlock.errors).toBeUndefined()
    const response = await visitResponse(eventWithReservation.id, 'invalid')
    expect(response.errors).toBeUndefined()
    expect(response.data.createVisit.clientName).toBe('Teacher')
  })
})

describe('Event without reservation', () => {
  /* it('can be reserved', async () => {
    const response = await lockEventResponse(eventWithoutReservation.id)
    expect(response.errors).toBeUndefined()
    expect(response.data.lockEvent.token).not.toBe(null)
  }) */ // T??M?? TESTI AIHEUTTAA JOSTAIN SYYST?? OPENHANDLEN

  it('can be booked with invalid token', async () => {
    const response = await visitResponse(eventWithoutReservation.id, 'invalid')
    expect(response.errors).toBeUndefined()
    expect(response.data.createVisit.clientName).toBe('Teacher')
  })

  it('can be modified', async () => {
    const response = await modifyResponse(eventWithoutReservation.id)
    expect(response.errors).toBeUndefined()
    expect(response.data.modifyEvent.title).toBe('modified')
  })

})
