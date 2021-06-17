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

  /*  it('login successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const LOGIN = gql`
      mutation {
        login(
          username: "admin"
          password: "admin-password"
        ){
          value
        }
      }
    `
    let response = await mutate({ mutation: LOGIN })
    expect(response.errors).toBeUndefined()
  })

  it('admin can create new user successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const CREATE_USER = gql`
      mutation {
        createUser(
          username: "new-user"
          password: "new-password"
          isAdmin: false
        ){
          username,
          isAdmin
        }
      }
    `
    let response = await mutate({ mutation: CREATE_USER })
    expect(response.errors).toBeUndefined()
  }) */
})

describe('User Model Test', () => {

  /* it('create & save user successfully', async () => {
    basicUserData = { username: 'Basic-user', passwordHash: 'password', isAdmin: false }
    const validUser = new UserModel(basicUserData)
    const savedUser = await validUser.save()
    expect(savedUser._id).toBeDefined()
    expect(savedUser.username).toBe(basicUserData.username)
    expect(savedUser.passwordHash).toBe(basicUserData.passwordHash)
    expect(savedUser.isAdmin).toBe(basicUserData.isAdmin)
  })

  it('insert user successfully, but the field not defined in schema should be "undefined"', async () => {
    const userWithInvalidField = new UserModel({ username: 'Basic user 2', passwordHash: 'password2', isAdmin: false, nickname: 'Bassy' })
    const savedUserWithInvalidField = await userWithInvalidField.save()
    expect(savedUserWithInvalidField._id).toBeDefined()
    expect(savedUserWithInvalidField.nickname).toBeUndefined()
  })

  it('cannot create user without required field', async () => {
    const userWithoutRequiredField = new UserModel({ username: 'Basic user 3' })
    let err
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save()
      err = savedUserWithoutRequiredField
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.passwordHash).toBeDefined()
  }) */
})

afterAll(async () => {
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})