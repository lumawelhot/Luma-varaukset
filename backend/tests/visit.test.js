const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const EventModel = require('../models/event')
const VisitModel = require('../models/visit')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let testEvent2
let savedTestVisit

beforeAll(async () => {
  
  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
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

  const testEventData1 = {
    title: 'All About Algebra',
    resourceId: 1,
    start: 'Mon Jun 07 2021 09:30:00 GMT+0300 (Eastern European Summer Time)',
    end: 'Thu Jun 10 2021 12:00:00 GMT+0300 (Eastern European Summer Time)'
  }
  const testEventData2 = {
    title: 'Up-And-Atom!',
    resourceId: 2,
    start: 'Fri May 21 2021 09:00:00 GMT+0300 (Eastern European Summer Time)',
    end: 'Fri May 21 2021 11:00:00 GMT+0300 (Eastern European Summer Time)'
  }

  const testEvent1 = new EventModel(testEventData1)
  testEvent2 = new EventModel(testEventData2)

  await testEvent1.save()
  await testEvent2.save()
  
  const testVisitData = {
    event: testEvent1,
    pin: 1234,
    gradeId: 1,
    online: true,
    clientName: "Teacher",
    clientEmail: "teacher@school.com",
    clientPhone: "040-1234567"
  }

  const testVisit = new VisitModel(testVisitData)
  savedTestVisit = await testVisit.save()
})

describe('Visit Model Test', () => {
  
    it('teacher can create new visit successfully', async () => {
        
        const newVisitData = {
            event: testEvent2,
            pin: 5678,
            gradeId: 4,
            online: false,
            clientName: "Teacher 2",
            clientEmail: "teacher2@someschool.com",
            clientPhone: "050-8912345"
        }
        const validVisit = new VisitModel(newVisitData)
        const savedVisit = await validVisit.save()
        expect(savedVisit._id).toBeDefined()
        expect(savedVisit.event).toBe(newVisitData.event)
        expect(savedVisit.pin).toBe(newVisitData.pin)
        expect(savedVisit.gradeId).toBe(newVisitData.gradeId)
        expect(savedVisit.online).toBe(newVisitData.online)
        expect(savedVisit.clientName).toBe(newVisitData.clientName)
        expect(savedVisit.clientEmail).toBe(newVisitData.clientEmail)
        expect(savedVisit.clientPhone).toBe(newVisitData.clientPhone)
    })
})

describe('Visit server test', () => {
    it("find by visit id", async () => {
        const { query } = createTestClient(server)
        const id = savedTestVisit.id // tämä on objekti, pitää muuttaa stringiksi
        console.log(id)
        const FIND_VISIT = gql`
        query {
          findVisit(id: id) {
            id
            pin
            event
            clientName
            clientEmail
            clientPhone
          }
        }
        `
        const { data } = await query({
          query: FIND_VISIT
        })
        const { findVisit } = data

        expect(findVisit._id).toBeDefined()
        expect(findVisit.event).toBe(savedTestVisit.event)
        expect(findVisit.pin).toBe(savedTestVisit.pin)
        expect(findVisit.gradeId).toBe(savedTestVisit.gradeId)
        expect(findVisit.online).toBe(savedTestVisit.online)
        expect(findVisit.clientName).toBe(savedTestVisit.clientName)
        expect(findVisit.clientEmail).toBe(savedTestVisit.clientEmail)
        expect(findVisit.clientPhone).toBe(savedTestVisit.clientPhone)
        
    })
})

afterAll(async () => {
  await EventModel.deleteMany({})
  await VisitModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})