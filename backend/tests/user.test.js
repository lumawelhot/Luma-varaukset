const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let basicUserData
let adminUserData
let serverAdmin
let serverBasic

beforeAll(async () => {
  // connect to database
  await mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => {
      console.log('connected to test-mongodb')
    })
    .catch((error) => {
      console.log('connection error: ', error.message)
    })
  await UserModel.deleteMany({})

  // create test data for admin user and basic user
  const adminPassword = await bcrypt.hash('admin-password', 10)
  const basicPassword = await bcrypt.hash('basic-password', 10)

  adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  basicUserData = { username: 'basic', passwordHash: basicPassword, isAdmin: false }

  const adminUser = new UserModel(adminUserData)
  const savedAdminUser = await adminUser.save()
  expect(savedAdminUser.isAdmin).toBe(adminUser.isAdmin)
  const basicUser = new UserModel(basicUserData)
  const savedBasicUser = await basicUser.save()
  expect(savedBasicUser.isAdmin).toBe(basicUser.isAdmin)

  // create test server for context "currentUser = admin"
  serverAdmin = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedAdminUser
      return { currentUser }
    }
  })

  // create test server for context "currentUser = basic"
  serverBasic = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = savedBasicUser
      return { currentUser }
    }
  })
})

describe('Server Test (currentUser = admin)', () => {

  it('get all users', async () => {
    const { query } = createTestClient(serverAdmin)
    const GET_ALL_USERS = gql`
      query {
        getUsers {
          id
          username
          isAdmin
        }
      }
    `
    const { data } = await query({
      query: GET_ALL_USERS
    })
    const { getUsers } = data
    getUsers.map(user => {
      expect(user.id).toBeDefined()
    })
    expect(getUsers.length).toBe(2)
  })

  it('login successfully', async () => {
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
  })
})

describe('Server Test (currentUser = basic)', () => {

  it('basic user cannot create new user', async () => {
    const { mutate } = createTestClient(serverBasic)
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
    expect(response.errors).toBeDefined()
  })

  it('return current user data correctly', async () => {
    const { query } = createTestClient(serverBasic)
    const ME = gql`
      query {
        me {
          id
          username
          isAdmin
        }
      }
    `
    const { data } = await query({
      query: ME
    })
    const { me } = data
    expect(me.username).toBe(basicUserData.username)
    expect(me.isAdmin).toBe(basicUserData.isAdmin)
  })
})

describe('User Model Test', () => {

  it('create & save user successfully', async () => {
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
  })
})

afterAll(async () => {
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})