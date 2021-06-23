const { gql } = require('apollo-server-express')

//Visit- ja Event-tyyppien kentät gradeId ja online tarkistettava
const typeDefs = gql`
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
    resourceids: [Int]
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
    clientName: String!
    schoolName: String!
    schoolLocation: String!
    clientEmail: String!
    clientPhone: String!
    grade: String!
    participants: Int!
    extra: [Int]
    status: Boolean!
    startTime: String!
    endTime: String!
    inPersonVisit: Boolean!
    remoteVisit: Boolean!
  }
  type Token {
    value: String!
  }
  type Extra {
    id: ID!
    name: String!
    classes: [Int]!
    remoteLength: Int!
    inPersonLength: Int!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
    findVisit(id: ID!): Visit!
    getVisits: [Visit]
    getTags: [Tag]!
    getExtras: [Extra]!
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
      scienceClass: [Int]!
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
      clientName: String!
      schoolName: String!
      schoolLocation: String!
      clientEmail: String!
      clientPhone: String!
      startTime: String!
      endTime: String!
      grade: String!
      participants: Int!
      extra: [Int]
      username: String
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
    ): Visit
    cancelVisit(id: ID!): Visit
    createExtra(
      name: String!
      classes: [Int]!
      remoteLength: Int!
      inPersonLength: Int!
    ): Extra
    deleteExtra(
      id: String!
    ): String
  }
`
module.exports = typeDefs