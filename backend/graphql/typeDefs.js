const { gql } = require('apollo-server-express')

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
  type Teaching {
    type: String!
    location: String
    payload: String
  }
  input ITeaching {
    type: String!
    location: String
    payload: String
  }
  type Event {
    id: ID!
    title: String!
    resourceids: [Int]
    remoteVisit: Boolean!
    inPersonVisit: Boolean!
    schoolVisit: Boolean!
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
    limits: String
    closedDays: Int
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
    teaching: Teaching
    dataUseAgreement: Boolean!
    customFormData: String
    language: String
    created: String
    cancellation: String
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
    me: User
    getEvent(id: ID!): Event!
    getEvents(ids: [ID]): [Event]!
    findVisit(id: ID!): Visit
    getVisits: [Visit]
    getTags: [Tag]!
    getExtras: [Extra]!
    getForms: [Form]
    getCancelForm: Form
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
    deleteGroups(
      ids: [ID]!
    ): [ID]
    assignEventsToGroup(
      events: [ID]
      group: ID!
    ): [Event]
    updateEmail(
      name: String!
      html: String
      text: String
      subject: String
      ad: [String]
      adSubject: String
      adText: String
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
      username: String
      isAdmin: Boolean
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
    createEvents(
      title: String!
      resourceids: [Int]!
      grades: [Int]!
      remotePlatforms: [Int]
      otherRemotePlatformOption: String
      start: String!
      end: String!
      dates: [String]!
      desc: String
      inPersonVisit: Boolean!
      remoteVisit: Boolean!
      schoolVisit: Boolean!
      tags: [String]
      waitingTime: Int!
      extras: [ID]
      duration: Int!
      customForm: ID
      group: ID
      publishDate: String
      languages: [String]
      limits: String
      closedDays: Int
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
      schoolVisit: Boolean
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
      limits: String
      closedDays: Int
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
      teaching: ITeaching
      dataUseAgreement: Boolean!
      token: String!
      customFormData: String
      language: String
    ): Visit
    modifyVisit(
      visit: ID!
      clientName: String
      schoolName: String
      schoolLocation: String
      clientEmail: String
      clientPhone: String
      grade: String
      participants: Int
      extras: [ID]
      teaching: ITeaching
      dataUseAgreement: Boolean
      customFormData: String
      language: String
      event: ID
      startTime: String
      endTime: String
    ): Visit
    disableEvent(
      event: ID!
    ): Event
    enableEvent(
      event: ID!
    ): Event
    cancelVisit(
      id: ID!
      cancellation: String
    ): Visit
    createExtra(
      name: String!
      classes: [Int]!
      remoteLength: Int!
      inPersonLength: Int!
    ): Extra
    modifyExtra(
      id: ID!
      name: String
      classes: [Int]
      remoteLength: Int
      inPersonLength: Int
    ): Extra
    deleteExtras(
      ids: [ID]!
    ): [ID]
    deleteEvents(
      ids: [ID]!
    ): [ID]
    forceDeleteEvents(
      events: [ID]!
      password: String!
    ): [Event]
    deleteUsers(
      ids: [ID]!
    ): [ID]
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
    ): [ID]
  }
  type Subscription {
    eventModified: Event
    eventsModified: [Event]
    eventsDeleted: [ID]
  }
`
module.exports = typeDefs
