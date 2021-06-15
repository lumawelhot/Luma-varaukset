const { gql } = require('apollo-server-express')

//Visit- ja Event-tyyppien kentät gradeId ja online tarkistettava
//Visit-tyypin pin-kentän palautus frontendiin estettävä sitten, kun pin palautetaan sähköpostitse
const typeDefs = gql `
  type Tag {
    id: ID
    name: String!
  }
  type User {
    id: ID!
    username: String!
    isAdmin: Boolean!
  }
  type Event {
    id: ID!
    title: String!
    resourceId: Int
    remoteVisit: Boolean!
    closeVisit: Boolean!
    grades: [Int]!
    start: String!
    end: String!
    desc: String
    tags: [Tag]!
    visits: [Visit]!
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
    status: Boolean!
  }
  type Token {
    value: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
    findVisit(id: ID!, pin: Int!): Visit!
    getVisits: [Visit]
    getTags: [Tag]!
  }
  input TagInput {
    id: String
    name: String!
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
      desc: String
      closeVisit: Boolean!
      remoteVisit: Boolean!
      tags: [TagInput]
    ): Event
    createVisit(
      event: ID!
      grade: Int!
      extra: [Int]
      clientName: String!
      clientEmail: String!
      clientPhone: String!
    ): Visit
    cancelVisit(id: ID!, pin: Int!): Visit
  }
`

module.exports = typeDefs