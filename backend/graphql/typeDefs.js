const { gql } = require('apollo-server-express')

//Visit- ja Event-tyyppien kentät gradeId ja online tarkistettava
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
  type TimeSlot {
    startTime: String!,
    endTime: String!
  }
  type Event {
    id: ID!
    title: String!
    resourceId: Int
    remoteVisit: Boolean!
    inPersonVisit: Boolean!
    grades: [Int]!
    start: String!
    end: String!
    desc: String
    tags: [Tag]!
    visits: [Visit]!
    availableTimes: [TimeSlot]!
    waitingTime: Int!
  }
  type Visit {
    id: ID!
    event: Event!
    grade: Int!
    extra: [Int]
    clientName: String!
    clientEmail: String!
    clientPhone: String!
    status: Boolean!
    startTime: String!
    endTime: String!
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
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      tags: [TagInput]
      waitingTime: Int!
    ): Event
    createVisit(
      event: ID!
      grade: Int!
      extra: [Int]
      clientName: String!
      clientEmail: String!
      clientPhone: String!
      startTime: String!
      endTime: String!
    ): Visit
    cancelVisit(id: ID!): Visit
  }
`

module.exports = typeDefs