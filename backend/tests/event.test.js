const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const Event = require('../models/event')
const User = require('../models/user')
const Extra = require('../models/extra')
const Tag = require('../models/tag')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { GET_ALL_EVENTS, CREATE_EVENT } = require('./testHelpers')
const { eventDetails1, eventDetails2, eventDetails3, eventDetails5, eventDetails4, invalidEventFieldDetails } = require('./testData')

let server = null
let newTags = []
let newExtras = []

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
  await Extra.deleteMany({})

  newTags = await Tag.insertMany({ name: 'Matematiikka' }, { name: 'Fysiikka' })

  const extra1 = new Extra({ name: 'Kampuskierros', classes: [1, 2, 3, 4], remoteLength: 5, inPersonLength: 15 })
  const extra2 = new Extra({ name: 'Opiskelijan elämää', remoteLength: 15, inPersonLength: 20, classes: [2, 3, 4] })
  const savedExtra1 = await extra1.save()
  const savedExtra2 = await extra2.save()
  newExtras = [savedExtra1, savedExtra2]

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

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

  const testData1 = {
    tags: newTags,
    extras: newExtras,
    ...eventDetails1
  }
  const testData2 = {
    tags: newTags,
    extras: newExtras,
    ...eventDetails2
  }

  const testData3 = {
    tags: newTags,
    extras: newExtras,
    ...eventDetails3
  }

  const testEvent1 = new Event(testData1)
  const testEvent2 = new Event(testData2)
  const testEvent3 = new Event(testData3)

  await testEvent1.save()
  await testEvent2.save()
  await testEvent3.save()
})

describe('Event Server Test', () => {

  it('get all events', async () => {
    const { query } = createTestClient(server)

    const { data } = await query({ query: GET_ALL_EVENTS })
    const { getEvents } = data
    getEvents.map(event => {
      expect(event.id).toBeDefined()
      expect(event.title).toBeDefined()
      expect(event.grades).toBeDefined()
      expect(event.tags).toBeDefined()
      expect(event.extras).toBeDefined()
      expect(event.extras.length).toBe(2)
      expect(event.resourceids).toBeDefined()
      expect(event.start).toBeDefined()
      expect(event.end).toBeDefined()
      expect(event.desc).toBeDefined()
    })
    expect(getEvents.length).toBe(2)
  })
})

it('employee can create new event successfully', async () => {
  const { mutate } = createTestClient(server)
  const response = await mutate({
    mutation: CREATE_EVENT,
    variables: eventDetails5
  })

  expect(response.data.createEvent.title).toBe('Learn JavaScript!')
  expect(response.data.createEvent.grades).toEqual([1, 3, 4])
  expect(response.data.createEvent.tags.map(tag => ({ name: tag.name }))).toEqual([{ name: 'Matematiikka' }, { name: 'Fysiikka' }, { name: 'Ohjelmointi' }, { name: 'Maantiede' }, { name: 'Kemia' } ])
  expect(response.errors).toBeUndefined()
})

describe('Event Model Test', () => {

  it('create & save new event successfully', async () => {
    const tags = await Tag.find({ name: { $in: ['Matematiikka', 'Fysiikka'] } })
    const eventData = {
      tags: tags,
      extras: newExtras,
      ...eventDetails4
    }

    const validEvent = new Event(eventData)
    const savedEvent = await validEvent.save()

    expect(savedEvent._id).toBeDefined()
    expect(savedEvent.title).toBe(eventData.title)
    expect(savedEvent.grades.toObject()).toEqual(eventData.grades)
    expect(savedEvent.tags.toObject().map(tag => tag.name)).toEqual(['Fysiikka','Matematiikka'])
    expect(savedEvent.resourceids.toObject()).toEqual(eventData.resourceids)
    expect(savedEvent.start).toBe(eventData.start)
    expect(savedEvent.end).toBe(eventData.end)
    expect(savedEvent.desc).toBe(eventData.desc)
    expect(savedEvent.extras.toObject().map(extra => extra.name)).toEqual(['Kampuskierros','Opiskelijan elämää'])
  })

  it('insert event successfully, but the field not defined in schema should be "undefined"', async () => {
    const eventWithInvalidField = new Event(invalidEventFieldDetails)
    const savedEventWithInvalidField = await eventWithInvalidField.save()
    expect(savedEventWithInvalidField._id).toBeDefined()
    expect(savedEventWithInvalidField.fieldNotInSchema).toBeUndefined()
  })

  it('cannot create event without required field', async () => {
    const eventWithoutRequiredField = new Event({ allDay: false })
    let err
    try {
      await eventWithoutRequiredField.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.end).toBeDefined()
    expect(err.errors.start).toBeDefined()
    expect(err.errors.title).toBeDefined()
    expect(err.errors.grades).toBeDefined()
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