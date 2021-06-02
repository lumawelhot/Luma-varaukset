const { gql } = require('apollo-server-express')

//Visit-tyypin kentät gradeId ja online muutettava pakollisiksi
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
    gradeId: Int
    start: String!
    end: String!
  }
  type Visit {
    id: ID!
    event: Event!
    pin: Int!
    gradeId: Int
    online: Boolean
    extra: [Int]
    clientName: String!
    clientEmail: String!
    clientPhone: String!
  }
  type Token {
    value: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
    findVisit(id: ID!): Visit!
    getVisits: [Visit]
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
      grade: String!
      start: String!
      end: String!
    ): Event
    createVisit(
      event: ID!
      gradeId: Int
      online: Boolean
      extra: [Int]
      clientName: String!
      clientEmail: String!
      clientPhone: String!
    ): Visit
    cancelVisit(id: ID!, pin: Int!): Visit
  }
`

module.exports = typeDefs