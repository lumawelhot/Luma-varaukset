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
    customForm: Form
    disabled: Boolean!
    locked: Boolean!
    group: Group
    publishDate: String
    languages: [String]

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
    customFormData: String
    language: String
  }
  type Token {
    value: String!
  }
  type Form {
    id: ID!
    name: String!
    fields: String!
  }
  type Group {
    id: ID!
    name: String!
    maxCount: Int!
    visitCount: Int!
    events: [Event]
    publishDate: String
    disabled: Boolean
  }
  type EmailTemplate {
    html: String!
    text: String!
    subject: String!
    name: String!
    ad: [String]!
    adSubject: String!
    adText: String!
  }
  type Query {
    getUsers: [User]!
    me: User!
    getEvent(id: ID!): Event!
    getEvents: [Event]!
    findVisit(id: ID!): Visit
    getVisits: [Visit]
    getTags: [Tag]!
    getExtras: [Extra]!
    getForm(id: ID): Form
    getForms: [Form]
    getEmailTemplates: [EmailTemplate]
    getGroups: [Group]
  }
  type Mutation {
    assignPublishDateToEvents(
      events: [ID]
      publishDate: String
    ): [Event]
    createGroup(
      name: String!
      maxCount: Int!
      publishDate: String
    ): Group
    modifyGroup(
      id: ID!
      name: String
      maxCount: Int
      publishDate: String
      disabled: Boolean
    ): Group
    deleteGroup(
      group: ID!
    ): String
    deleteGroups(
      ids: [ID]!
    ): String
    assignEventsToGroup(
      events: [ID]
      group: ID!
    ): [Event]
    updateEmail(
      name: String!
      html: String!
      text: String!
      subject: String!
      ad: [String]!
      adSubject: String!
      adText: String!
    ): EmailTemplate
    lockEvent(
      event: ID!
    ): Lock
    unlockEvent(
      event: ID!
    ): Event
    updateUser(
      user: ID!
      password: String
      username: String!
      isAdmin: Boolean!
    ): User
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
      group: ID
      publishDate: String
      languages: [String]
    ): Event
    createEvents(
      title: String!
      scienceClass: [Int]!
      grades: [Int]!
      remotePlatforms: [Int]
      otherRemotePlatformOption: String
      start: String!
      end: String!
      dates: [String]!
      desc: String
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      tags: [String]
      waitingTime: Int!
      extras: [ID]
      duration: Int!
      customForm: ID
      group: ID
      publishDate: String
      languages: [String]
    ): [Event]
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
      group: ID
      publishDate: String
      languages: [String]
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
      customFormData: String
      language: String
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
    modifyExtra(
      id: ID!
      name: String!
      classes: [Int]!
      remoteLength: Int!
      inPersonLength: Int!
    ): Extra
    deleteExtra(
      id: String!
    ): String
    deleteExtras(
      ids: [String]!
    ): String
    deleteEvent(
      id: String!
    ): String
    deleteEvents(
      ids: [ID]
    ): [ID]
    forceDeleteEvents(
      events: [ID]
      password: String!
    ): [Event]
    deleteUsers(
      ids: [ID]!
    ): String
    createForm(
      name: String!
      fields: String
    ): Form
    updateForm(
      id: ID!
      name: String!
      fields: String
    ): Form
    deleteForms(
      ids: [ID]!
    ): String
  }
  type Subscription {
    eventModified: Event
    eventsDeleted: [Event]
  }
`
module.exports = typeDefs