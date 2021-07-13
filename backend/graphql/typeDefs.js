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
  type Extra {
    id: ID!
    name: String!
    classes: [Int]!
    remoteLength: Int!
    inPersonLength: Int!
  }
  type Event {
    id: ID!
    title: String!
    resourceids: [Int]
    remoteVisit: Boolean!
    inPersonVisit: Boolean!
    grades: [Int]!
    remotePlatforms: [Int]
    otherRemotePlatformOption: String
    start: String!
    end: String!
    desc: String
    tags: [Tag]!
    visits: [Visit]!
    availableTimes: [TimeSlot]!
    waitingTime: Int!
    extras: [Extra]
    duration: Int!
  }
  type Visit {
    id: ID!
    event: Event
    clientName: String!
    schoolName: String!
    schoolLocation: String!
    clientEmail: String!
    clientPhone: String!
    grade: String!
    participants: Int!
    extras: [Extra]
    status: Boolean!
    startTime: String!
    endTime: String!
    inPersonVisit: Boolean!
    remoteVisit: Boolean!
    dataUseAgreement: Boolean!
    remotePlatform: String
  }
  type Token {
    value: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
    findVisit(id: ID!): Visit
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
      remotePlatforms: [Int]
      otherRemotePlatformOption: String
      start: String!
      end: String!
      desc: String
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      tags: [TagInput]
      waitingTime: Int!
      extras: [ID]
      duration: Int!
    ): Event
    modifyEvent(
      event: ID!
      title: String
      resourceids: [Int]
      grades: [Int]
      remotePlatforms: [Int]
      otherRemotePlatformOption: String
      desc: String
      inPersonVisit: Boolean
      remoteVisit: Boolean
      extras: [ID]
      #start: String
      #end: String
      tags: [TagInput]
      #waitingTime: Int!
      #duration: Int!
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
      extras: [ID]
      username: String
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      dataUseAgreement: Boolean!
      remotePlatform: String
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
    deleteEvent(
      id: String!
    ): String
    deleteUser(
      id: String!
    ): String
  }
`
module.exports = typeDefs