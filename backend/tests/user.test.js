const mongoose = require('mongoose')
const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const UserModel = require('../models/user')
const typeDefs = require('../graphql/typeDefs')
const resolvers = require('../graphql/resolvers')

let basicUserData
let adminUserData
let server

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

  const adminPassword = await bcrypt.hash('password', 10)
  adminUserData = { username: 'admin', passwordHash: adminPassword, isAdmin: true }
  const adminUser = new UserModel(adminUserData)
  const savedAdminUser = await adminUser.save()
  expect(savedAdminUser.isAdmin).toBe(adminUser.isAdmin)
  
  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const currentUser = savedAdminUser
      return { currentUser }
    }
  })
})

describe('Server Test', () => {

  it("get all users", async () => {
    const { query } = createTestClient(server)
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
      expect(user.username).toBe(adminUserData.username)
      expect(user.isAdmin).toBe(adminUserData.isAdmin)
    })
  })
  
  it("login successfully", async () => {
    const { mutate } = createTestClient(server)
    const LOGIN = gql`
      mutation {
        login(
          username: "admin"
          password: "password"
        ){
          value
        }
      }
    `
    let response = await mutate({ mutation: LOGIN })
    expect(response.errors).toBeUndefined()
  })
  
  it("admin can create new user successfully", async () => {
    const { mutate } = createTestClient(server)
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

  it("basic user cannot create new user", async () => {
    server2 = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        const currentUser = { username: 'username', passwordHash: 'password', isAdmin: false}
        return { currentUser }
      }
    })
    const { mutate } = createTestClient(server2)
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

  it('insert user successfully, but the field not defined in schema should be undefined', async () => {
    const userWithInvalidField = new UserModel({ username: 'Basic user 2', passwordHash: 'password2', isAdmin: false, nickname: 'Bassy' })
    const savedUserWithInvalidField = await userWithInvalidField.save()
    expect(savedUserWithInvalidField._id).toBeDefined()
    expect(savedUserWithInvalidField.nickname).toBeUndefined()
  })

  it('create user without required field should fail', async () => {
    const userWithoutRequiredField = new UserModel({ username: 'Basic user 3' })
    let err
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save()
      error = savedUserWithoutRequiredField;
    } catch (error) {
      err = error
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    expect(err.errors.passwordHash).toBeDefined();
  })
})

afterAll(async () => {
  await UserModel.deleteMany({})
  await mongoose.connection.close()
  console.log('test-mongodb connection closed')
})