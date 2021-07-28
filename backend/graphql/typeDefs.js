const { gql } = require('apollo-server-express')

//Visit- ja Event-tyyppien kentät gradeId ja online tarkistettava
const typeDefs = gql`
  type Lock {
    event: ID!
    token: String!
    locked: Boolean!
  }
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
    customForm: ID
    disabled: Boolean!
    locked: Boolean!
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
  type Form {
    id: ID!
    name: String!
    fields: String!
  }
  type FormSubmissions {
    id: ID
    form: Form
    values: String
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvents: [Event]!
    findVisit(id: ID!): Visit
    getVisits: [Visit]
    getTags: [Tag]!
    getExtras: [Extra]!
    getForm(id: ID): Form
    getForms: [Form]
    getFormSubmissions(formID: ID): FormSubmissions
    getFormSubmission(id: ID): FormSubmissions
  }
  type Mutation {
    lockEvent(
      event: ID!
    ): Lock
    unlockEvent(
      event: ID!
    ): Event
    resetPassword(
      user: ID!
      password: String!
    ): User
    changeUsername(
      user: ID!
      username: String!
      isAdmin: Boolean!
    ): User
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
      tags: [String]
      waitingTime: Int!
      extras: [ID]
      duration: Int!
      customForm: ID
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
      start: String
      end: String
      tags: [String]
      #waitingTime: Int!
      #duration: Int!
      customForm: ID
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
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      dataUseAgreement: Boolean!
      remotePlatform: String
      token: String!
    ): Visit
    disableEvent(
      event: ID!
    ): Event
    enableEvent(
      event: ID!
    ): Event
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
    createForm(
      name: String!
      fields: String
    ): Form
    createFormSubmission(
      formID: ID
      values: String
    ): FormSubmissions
    updateForm(
      id: ID!
      name: String!
      fields: String
    ): Form
    deleteForm(
      id: ID!
    ): String
  }
  type Subscription {
    eventModified: Event
  }
`
module.exports = typeDefs