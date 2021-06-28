const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const EventModel = require('../models/event')
const UserModel = require('../models/user')
const ExtraModel = require('../models/extra')
const TagModel = require('../models/tag')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { subDays, set } = require('date-fns')

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
  await UserModel.deleteMany({})
  await EventModel.deleteMany()
  await ExtraModel.deleteMany()

  newTags = await TagModel.insertMany({ name: 'Matematiikka' }, { name: 'Fysiikka' })

  const extra1 = new ExtraModel({ name: 'Kampuskierros', classes: [1, 2, 3, 4], remoteLength: 5, inPersonLength: 15 })
  const extra2 = new ExtraModel({ name: 'Opiskelijan elämää', remoteLength: 15, inPersonLength: 20, classes: [2, 3, 4] })
  const savedExtra1 = await extra1.save()
  const savedExtra2 = await extra2.save()
  newExtras = [savedExtra1, savedExtra2]

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
    resourceids: [1],
    grades: [1, 2],
    desc: 'Algebra is one of the broad areas of mathematics, together with number theory, geometry and analysis.',
    tags: newTags,
    extras: newExtras,
    start: set(new Date(), { hours: 9, minutes: 30, seconds: 0, milliseconds: 0 }).toISOString(),
    end: set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
    booked: false,
    inPersonVisit: true,
    remoteVisit: false,
    waitingTime: 15,
    duration: 60
  }
  const testData2 = {
    title: 'Up-And-Atom!',
    resourceids: [2],
    grades: [4],
    desc: 'Atom is a programming text editor developed by GitHub.',
    tags: newTags,
    start: set(new Date(), { hours: 9, minutes: 30, seconds: 0, milliseconds: 0 }).toISOString(),
    end: set(new Date(), { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
    booked: false,
    inPersonVisit: false,
    remoteVisit: true,
    waitingTime: 15,
    duration: 75,
    extras: newExtras
  }
  const testData3 = {
    title: 'Old event!',
    resourceids: [1],
    grades: [2],
    desc: '3',
    tags: newTags,
    start: subDays(new Date(), 100).toISOString(),
    end: subDays(new Date(), 100).toISOString(),
    booked: false,
    inPersonVisit: false,
    remoteVisit: true,
    waitingTime: 15,
    duration: 75,
    extras: newExtras
  }

  const testEvent1 = new EventModel(testData1)
  const testEvent2 = new EventModel(testData2)
  const testEvent3 = new EventModel(testData3)

  await testEvent1.save()
  await testEvent2.save()
  await testEvent3.save()
})

describe('Event Server Test', () => {

  it('get all events', async () => {
    const { query } = createTestClient(server)
    const GET_ALL_EVENTS = gql`
    query {
      getEvents {
        id
        title
        resourceids
        grades
        tags {
          id
          name
        }
        start
        end
        desc
        extras {
          name
        }
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
  const CREATE_EVENT = gql`
      mutation {
        createEvent(
          title: "Learn JavaScript!"
          scienceClass: [1,4]
          start: "2021-06-01T10:00:00+0300"
          end: "2021-06-01T12:00:00+0300"
          desc: "JavaScript is the programming language of the Web."
          remoteVisit: true
          inPersonVisit: false
          grades: [1, 3, 4]
          tags: [{ name: "Matematiikka" }, { name: "Fysiikka" }, { name: "Ohjelmointi" }, { name: "Maantiede" }, { name: "Kemia" } ]
          waitingTime: 15
          duration: 60,
          extras: []
        ){
          title,
          resourceids,
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
    const tags = await TagModel.find({ name: { $in: ['Matematiikka', 'Fysiikka'] } })
    const eventData = {
      title: 'New-event',
      resourceids: [2],
      grades: [3, 4],
      tags: tags,
      start: '2021-06-01T10:00:00+0300',
      end: '2021-06-01T12:00:00+0300',
      inPersonVisit: true,
      remoteVisit: false,
      desc: 'Test event desc.',
      waitingTime: 15,
      duration: 75,
      extras: newExtras
    }

    const validEvent = new EventModel(eventData)
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
    const eventWithInvalidField = new EventModel({
      title: 'New-event',
      resourceids: [2],
      grades: [1],
      start: '2021-06-01T09:00:00+0300',
      end: '2021-06-02T15:00:00+0300',
      inPersonVisit: true,
      remoteVisit: false,
      fieldNotInSchema: 'Tiedeluokka Linkki',
      desc: 'Test event desc.',
      waitingTime: 15,
      duration: 10,
      extras: []
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
    expect(err.errors.title).toBeDefined()
    expect(err.errors.grades).toBeDefined()
  })

/* it('cannot create event with end time before start time', async () => {
    const eventWithEndBeforeStart = new EventModel({
        title: 'New-event',
        resourceids: 2,
        start: 'Tue Jun 01 2021 09:01:00 GMT+0300 (Eastern European Summer Time)',
        end: 'Tue Jun 01 2021 09:00:00 GMT+0300 (Eastern European Summer Time)'
    })
  }) */
})



afterAll(async () => {
  await EventModel.deleteMany({})
  await UserModel.deleteMany({})
  await ExtraModel.deleteMany({})
  await TagModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})