const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const User = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')
const { USERS, CREATE_USER, ME, LOGIN } = require('./testHelpers')

let basicUser
let adminUser
let serverAdmin
let serverBasic

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

  const adminPassword = await bcrypt.hash('admin-password', 10)
  const basicPassword = await bcrypt.hash('basic-password', 10)

  const adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  const basicUserData = { username: 'basic', passwordHash: basicPassword, isAdmin: false }

  adminUser = new User(adminUserData)
  await adminUser.save()

  basicUser = new User(basicUserData)
  await basicUser.save()

  serverAdmin = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = adminUser
      return { currentUser }
    }
  })

  serverBasic = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => {
      const currentUser = basicUser
      return { currentUser }
    }
  })
})

describe('Server Test (currentUser = admin)', () => {

  it('get all users', async () => {
    const { query } = createTestClient(serverAdmin)
    const { data } = await query({ query: USERS })
    const { getUsers } = data
    getUsers.map(user => {
      expect(user.id).toBeDefined()
    })
    expect(getUsers.length).toBe(2)
  })

  it('login successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const response = await mutate({
      mutation: LOGIN,
      variables: {
        username: 'admin',
        password: 'admin-password'
      }
    })
    expect(response.errors).toBeUndefined()
  })

  it('admin can create new user successfully', async () => {
    const { mutate } = createTestClient(serverAdmin)
    const response = await mutate({
      mutation: CREATE_USER,
      variables: {
        username: 'new-user',
        password: 'new-password',
        isAdmin: false
      }
    })
    expect(response.errors).toBeUndefined()
  })
})

describe('Server Test (currentUser = basic)', () => {

  it('basic user cannot create new user', async () => {
    const { mutate } = createTestClient(serverBasic)
    const response = await mutate({
      mutation: CREATE_USER,
      variables: {
        username: 'new-user',
        password: 'new-password',
        isAdmin: false
      }
    })
    expect(response.errors).toBeDefined()
  })

  it('return current user data correctly', async () => {
    const { query } = createTestClient(serverBasic)
    const { data } = await query({ query: ME })
    const { me } = data
    expect(me.username).toBe(basicUser.username)
    expect(me.isAdmin).toBe(basicUser.isAdmin)
  })
})

describe('User model test. User', () => {

  it('is successfully saved with valid information', async () => {
    basicUser = { username: 'Basic-user', passwordHash: 'password', isAdmin: false }
    const validUser = new User(basicUser)
    const savedUser = await validUser.save()
    expect(savedUser.id).toBe(validUser.id)
    expect(savedUser.username).toBe('Basic-user')
    expect(savedUser.passwordHash).toBe('password')
    expect(savedUser.isAdmin).toBe(false)
  })

  it('is not saved if any information missing', async () => {
    const userWithoutRequiredField = new User({ username: 'Basic user 3' })
    let error
    try {
      await userWithoutRequiredField.save()
    } catch (e) {
      error = e
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(error.errors.passwordHash).toBeDefined()
  })
})

afterAll(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})