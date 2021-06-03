const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const EventModel = require('../models/event')
const UserModel = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

beforeAll(async () => {
  
  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  await UserModel.deleteMany({})

  const userPassword = await bcrypt.hash('password', 10)
  userData = { username: 'employee', passwordHash: userPassword, isAdmin: false }

  const user = new UserModel(userData)
  const savedUser = await user.save()
  expect(savedUser.isAdmin).toBe(user.isAdmin)

  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const currentUser = savedUser
      return { currentUser }
    }
  })
})

beforeEach(async () => {
  await EventModel.deleteMany()

  const testData1 = {
    title: 'All About Algebra',
    resourceId: 1,
    start: 'Mon Jun 07 2021 09:30:00 GMT+0300 (Eastern European Summer Time)',
    end: 'Thu Jun 10 2021 12:00:00 GMT+0300 (Eastern European Summer Time)'
  }
  const testData2 = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    start: 'Fri May 21 2021 09:00:00 GMT+0300 (Eastern European Summer Time)',
    end: 'Fri May 21 2021 11:00:00 GMT+0300 (Eastern European Summer Time)'
  }

  const testEvent1 = new EventModel(testData1)
  const testEvent2 = new EventModel(testData2)

  await testEvent1.save()
  await testEvent2.save()
})

describe('Event Server Test', () => {

  it("get all events", async () => {
    const { query } = createTestClient(server)
    const GET_ALL_EVENTS = gql`
    query {
      getEvents {
      id
      title
      resourceId
      start
      end
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
      expect(event.resourceId).toBeDefined()
      expect(event.start).toBeDefined()
      expect(event.end).toBeDefined()
    })
    expect(getEvents.length).toBe(2)
  })

  it("employee can create new event successfully", async () => {
    const { mutate } = createTestClient(server)
    const CREATE_EVENT = gql`
      mutation {
        createEvent(
          title: "Learn JavaScript!"
          class: "LINKKI"
          start: "Tue Jun 01 2021 10:00:00 GMT+0300 (Eastern European Summer Time)"
          end: "Tue Jun 01 2021 12:00:00 GMT+0300 (Eastern European Summer Time)"
          grades: ${JSON.stringify([1, 3, 4])}
        ){
          title,
          resourceId,
          start,
          end,
          gradeIds
        }
      }
    `
    let response = await mutate({ mutation: CREATE_EVENT })
    expect(response.data.createEvent.title).toBe('Learn JavaScript!')
    expect(response.data.createEvent.gradeIds).toEqual([1, 3, 4])
    expect(response.errors).toBeUndefined()
  })
})

describe('Event Model Test', () => {

  it('create & save new event successfully', async () => {
    const eventData = {
        title: 'New-event',
        resourceId: 2,
        start: 'Tue Jun 01 2021 10:00:00 GMT+0300 (Eastern European Summer Time)',
        end: 'Tue Jun 01 2021 12:00:00 GMT+0300 (Eastern European Summer Time)' }
    const validEvent = new EventModel(eventData)
    const savedEvent = await validEvent.save()
    expect(savedEvent._id).toBeDefined()
    expect(savedEvent.title).toBe(eventData.title)
    expect(savedEvent.resourceId).toBe(eventData.resourceId)
    expect(savedEvent.start).toBe(eventData.start)
    expect(savedEvent.end).toBe(eventData.end)
  })

  it('insert event successfully, but the field not defined in schema should be "undefined"', async () => {
    const eventWithInvalidField = new EventModel({
        title: 'New-event',
        resourceId: 2,
        start: 'Tue Jun 01 2021 09:00:00 GMT+0300 (Eastern European Summer Time)',
        end: 'Wed Jun 02 2021 15:00:00 GMT+0300 (Eastern European Summer Time)',
        fieldNotInSchema: 'Tiedeluokka Linkki' })
    const savedEventWithInvalidField = await eventWithInvalidField.save()
    expect(savedEventWithInvalidField._id).toBeDefined()
    expect(savedEventWithInvalidField.fieldNotInSchema).toBeUndefined()
  })

  it('cannot create event without required field', async () => {
    const eventWithoutRequiredField = new EventModel({ allDay: false })
    let err
    try {
      const savedEventWithoutRequiredField = await eventWithoutRequiredField.save()
      error = savedEventWithoutRequiredField
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.end).toBeDefined()
    expect(err.errors.start).toBeDefined()
    expect(err.errors.resourceId).toBeDefined()
    expect(err.errors.title).toBeDefined()
  })

  /* it('cannot create event with end time before start time', async () => {
    const eventWithEndBeforeStart = new EventModel({
        title: 'New-event',
        resourceId: 2,
        start: 'Tue Jun 01 2021 09:01:00 GMT+0300 (Eastern European Summer Time)',
        end: 'Tue Jun 01 2021 09:00:00 GMT+0300 (Eastern European Summer Time)'
    })
  }) */
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})