const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const EventModel = require('../models/event')
const UserModel = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const Tag = require('../models/tag')
let server = null
let newTags = []


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
  await EventModel.deleteMany()
  newTags = await Tag.insertMany({ name: 'Matematiikka' }, { name: 'Fysiikka' })

  const userPassword = await bcrypt.hash('password', 10)
  const userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const user = new UserModel(userData)
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
    title: 'All About Algebra',
    resourceId: 1,
    grades: [1, 2],
    desc: 'Algebra is one of the broad areas of mathematics, together with number theory, geometry and analysis.',
    tags: newTags,
    start: '2021-07-07T09:30:00+0300',
    end: '2021-07-07T12:00:00+0300',
    booked: false,
    inPersonVisit: true,
    remoteVisit: false
  }
  const testData2 = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    grades: [4],
    desc: 'Atom is a programming text editor developed by GitHub.',
    tags: newTags,
    start: '2021-05-21T09:00:00+0300',
    end: '2021-05-21T11:00:00+0300',
    booked: false,
    inPersonVisit: false,
    remoteVisit: true
  }

  const testEvent1 = new EventModel(testData1)
  const testEvent2 = new EventModel(testData2)

  await testEvent1.save()
  await testEvent2.save()
})

describe('Event Server Test', () => {

  it('get all events', async () => {
    const { query } = createTestClient(server)
    const GET_ALL_EVENTS = gql`
    query {
      getEvents {
        id
        title
        resourceId
        grades
        tags {
          id
          name
        }
        start
        end
        desc
      }
    }
    `
    const { data } = await query({
      query: GET_ALL_EVENTS
    })
    const { getEvents } = data
    getEvents.map(event => {
      expect(event.id).toBeDefined()
      expect(event.title).toBeDefined()
      expect(event.grades).toBeDefined()
      expect(event.tags).toBeDefined()
      expect(event.resourceId).toBeDefined()
      expect(event.start).toBeDefined()
      expect(event.end).toBeDefined()
      expect(event.desc).toBeDefined()
    })
    expect(getEvents.length).toBe(2)
  })
})
it('employee can create new event successfully', async () => {
  const { mutate } = createTestClient(server)
  const CREATE_EVENT = gql`
      mutation {
        createEvent(
          title: "Learn JavaScript!"
          class: "LINKKI"
          start: "2021-06-01T10:00:00+0300"
          end: "2021-06-01T12:00:00+0300"
          desc: "JavaScript is the programming language of the Web."
          remoteVisit: true
          inPersonVisit: false
          grades: [1, 3, 4]
          tags: [{ name: "Matematiikka" }, { name: "Fysiikka" }, { name: "Ohjelmointi" }, { name: "Maantiede" }, { name: "Kemia" } ]
        ){
          title,
          resourceId,
          start,
          end,
          grades,
          desc
          tags {
            name
          }
        }
      }
    `
  let response = await mutate({ mutation: CREATE_EVENT })
  expect(response.data.createEvent.title).toBe('Learn JavaScript!')
  expect(response.data.createEvent.grades).toEqual([1, 3, 4])
  expect(response.data.createEvent.tags).toEqual([{ name: 'Matematiikka' }, { name: 'Fysiikka' }, { name: 'Ohjelmointi' }, { name: 'Maantiede' }, { name: 'Kemia' } ])
  expect(response.errors).toBeUndefined()
})


describe('Event Model Test', () => {

  it('create & save new event successfully', async () => {
    const tags = await Tag.find({ name: { $in: ['Matematiikka', 'Fysiikka'] } })
    const eventData = {
      title: 'New-event',
      resourceId: 2,
      grades: [3, 4],
      tags: tags,
      start: '2021-06-01T10:00:00+0300',
      end: '2021-06-01T12:00:00+0300',
      inPersonVisit: true,
      remoteVisit: false,
      desc: 'Test event desc.'
    }
    const validEvent = new EventModel(eventData)
    const savedEvent = await validEvent.save()
    expect(savedEvent._id).toBeDefined()
    expect(savedEvent.title).toBe(eventData.title)
    expect(savedEvent.grades.toObject()).toEqual(eventData.grades)
    expect(savedEvent.tags.toObject().map(tag => tag.name)).toEqual(['Fysiikka','Matematiikka'])
    expect(savedEvent.resourceId).toBe(eventData.resourceId)
    expect(savedEvent.start).toBe(eventData.start)
    expect(savedEvent.end).toBe(eventData.end)
    expect(savedEvent.desc).toBe(eventData.desc)
  })

  it('insert event successfully, but the field not defined in schema should be "undefined"', async () => {
    const eventWithInvalidField = new EventModel({
      title: 'New-event',
      resourceId: 2,
      grades: [1],
      start: '2021-06-01T09:00:00+0300',
      end: '2021-06-02T15:00:00+0300',
      inPersonVisit: true,
      remoteVisit: false,
      fieldNotInSchema: 'Tiedeluokka Linkki',
      desc: 'Test event desc.'
    })
    const savedEventWithInvalidField = await eventWithInvalidField.save()
    expect(savedEventWithInvalidField._id).toBeDefined()
    expect(savedEventWithInvalidField.fieldNotInSchema).toBeUndefined()
  })

  it('cannot create event without required field', async () => {
    const eventWithoutRequiredField = new EventModel({ allDay: false })
    let err
    try {
      await eventWithoutRequiredField.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.end).toBeDefined()
    expect(err.errors.start).toBeDefined()
    expect(err.errors.resourceId).toBeDefined()
    expect(err.errors.title).toBeDefined()
    expect(err.errors.grades).toBeDefined()
  })

/* it('cannot create event with end time before start time', async () => {
    const eventWithEndBeforeStart = new EventModel({
        title: 'New-event',
        resourceId: 2,
        start: '2021-06-01T09:00:00+0300',
        end: '2021-06-01T09:01:00+0300'
    })
  }) */
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})