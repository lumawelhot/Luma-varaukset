const { gql } = require('apollo-server-express')

//Visit- ja Event-tyyppien kentät gradeId ja online tarkistettava
//Visit-tyypin pin-kentän palautus frontendiin estettävä sitten, kun pin palautetaan sähköpostitse
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
    grades: [Int]!
    start: String!
    end: String!
  }
  type Visit {
    id: ID!
    event: Event!
    pin: Int!
    grade: Int!
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
      grades: [Int]!
      start: String!
      end: String!
    ): Event
    createVisit(
      event: ID!
      grade: Int
      extra: [Int]
      clientName: String!
      clientEmail: String!
      clientPhone: String!
    ): Visit
    cancelVisit(id: ID!, pin: Int!): Visit
  }
`

module.exports = typeDefs