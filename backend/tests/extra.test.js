const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const ExtraModel = require('../models/extra')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let adminUserData
let extraData
let serverAdmin

beforeAll(async () => {
  // connect to database
  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  await UserModel.deleteMany({})

  const adminPassword = await bcrypt.hash('admin-password', 10)
  adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  const adminUser = new UserModel(adminUserData)
  const savedAdminUser = await adminUser.save()
  expect(savedAdminUser.isAdmin).toBe(adminUser.isAdmin)

  extraData = { name: 'kampuskierros', classes: [1,2], remoteLength: 5 , inPersonLength: 15 }
  const extra = new ExtraModel(extraData)
  await extra.save()

  serverAdmin = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedAdminUser
      return { currentUser }
    }
  })
})

describe('Server Test (currentUser = admin)', () => {

  it('get all extras', async () => {
    const { query } = createTestClient(serverAdmin)
    const GET_ALL_EXTRAS = gql`
      query {
        getExtras {
          id
          name
          classes
          remoteLength
          inPersonLength
        }
      }
    `
    const { data } = await query({
      query: GET_ALL_EXTRAS
    })
    const { getExtras } = data
    getExtras.map(extra => {
      expect(extra.id).toBeDefined()
    })
    expect(getExtras.length).toBe(1)
  })

  it('current user can create new extra successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const CREATE_EXTRA = gql`
      mutation {
        createExtra(
            name: "Tieteenalan esittely"
            classes: [2, 3]
            remoteLength: 5 
            inPersonLength: 15
        ){
          name,
          classes,
          remoteLength,
          inPersonLength
        }
      }
    `
    let response = await mutate({ mutation: CREATE_EXTRA })
    expect(response.errors).toBeUndefined()
  })
})

describe('Extra Model Test', () => {

  it('create & save extra successfully', async () => {
    const newExtraData = { name: 'tieteenalan esittely', classes: [1, 2, 3, 4, 5], remoteLength: 5 , inPersonLength: 15 }
    const newExtra = new ExtraModel(newExtraData)
    const savedExtra = await newExtra.save()

    expect(savedExtra._id).toBeDefined()
    expect(savedExtra.name).toBe(newExtraData.name)
    expect(savedExtra.classes.length).toBe(5)
    expect(savedExtra.remoteLength).toBe(newExtraData.remoteLength)
    expect(savedExtra.inPersonLength).toBe(newExtraData.inPersonLength)
  })

  it('insert extra successfully, but the field not defined in schema should be "undefined"', async () => {
    const extraWithInvalidField = new ExtraModel({ name: 'opiskelijan elämää - tyypillinen päivä', classes: [1, 2, 3, 4, 5], remoteLength: 5 , inPersonLength: 15, additionalField: true })
    const savedExtraWithInvalidField = await extraWithInvalidField.save()
    expect(savedExtraWithInvalidField._id).toBeDefined()
    expect(savedExtraWithInvalidField.additionalField).toBeUndefined()
  })

  it('cannot create extra without required field', async () => {
    const extraWithoutRequiredField = new ExtraModel({ name: 'lisäpalvelu' })
    let err
    try {
      await extraWithoutRequiredField.save()
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.remoteLength).toBeDefined()
    expect(err.errors.inPersonLength).toBeDefined()
  })
})

afterAll(async () => {
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})