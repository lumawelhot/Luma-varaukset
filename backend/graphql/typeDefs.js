const { gql } = require('apollo-server-express')

const typeDefs = gql `
  type User {
    id: ID!
    username: String!
    isAdmin: Boolean!
  }
  type Event {
    id: ID!
    title: String!
    resourceId: Int
    start: String!
    end: String!
    description: String
  }
  type Token {
    value: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
  }
  type Mutation {
    createUser(
      username: String!
      password: String!
      isAdmin: Boolean!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    createEvent(
      title: String!
      class: String!
      start: String!
      end: String!
      description: String
    ): Event
  }
`

module.exports = typeDefs