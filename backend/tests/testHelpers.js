const { gql } = require('apollo-server-express')
const setHours = require('date-fns/setHours')
const setMinutes = require('date-fns/setMinutes')
const setSeconds = require('date-fns/setSeconds')
const setMilliseconds = require('date-fns/setMilliseconds')
const add = require('date-fns/add')
const { getUnixTime } = require('date-fns')

const createDate = (hours, minutes) => setMilliseconds(setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), hours), minutes), 0), 0)

const CANCEL_VISIT = gql `
  mutation cancelVisit($id: ID!) {
    cancelVisit(id: $id) {
      id
      status
    }
  }
`

const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!, $isAdmin: Boolean!) {
    createUser(
      username: $username,
      password: $password,
      isAdmin: $isAdmin
    ) {
      username,
      isAdmin
    }
  }
`

const CREATE_VISIT = gql `
  mutation createVisit(
    $event: ID!
    $clientName: String!
    $schoolName: String!
    $schoolLocation: String!
    $clientEmail: String!
    $clientPhone: String!
    $grade: String!
    $participants: Int!
    $startTime: String!
    $endTime: String!,
    $inPersonVisit: Boolean!,
    $remoteVisit: Boolean!,
    $dataUseAgreement: Boolean!
    $token: String!
    $customFormData: String
    ) {
    createVisit(
      event: $event
      clientName: $clientName
      schoolName: $schoolName
      schoolLocation: $schoolLocation
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      startTime: $startTime
      endTime: $endTime
      inPersonVisit: $inPersonVisit,
      remoteVisit: $remoteVisit,
      dataUseAgreement: $dataUseAgreement
      grade: $grade
      participants: $participants
      token: $token
      customFormData: $customFormData
    ) {
      id
      event {
        id
        title
        availableTimes {
          startTime
          endTime
        }
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      startTime
      endTime
      grade
      participants
      status
      dataUseAgreement
      customFormData
    }
  }
`

const GET_ALL_VISITS = gql `
  query {
    getVisits {
      id
      event {
        id
      }
      startTime
      endTime
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      status
      dataUseAgreement
      customFormData
    }
  }
`

const GET_ALL_EVENTS = gql `
  query {
    getEvents {
      id
      title
      resourceids
      grades
      tags {
        id
        name
      }
      start
      end
      desc
      extras {
        name
      }
    }
  }
  `

const FIND_VISIT = gql `
  query findVisit($id: ID!) {
    findVisit(id: $id) {
      id
      event {
        id
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      status
      dataUseAgreement
      customFormData
    }
  }
`

const LOGIN = gql`
  mutation {
    login(
      username: "basic"
      password: "basic-password"
    ) {
      value
    }
  }
`

const CREATE_EVENT = gql `
  mutation createEvent(
    $title: String!,
    $start: String!,
    $end: String!,
    $scienceClass: [Int]!,
    $grades: [Int]!,
    $remotePlatforms: [Int],
    $otherRemotePlatformOption: String,
    $remoteVisit: Boolean!,
    $inPersonVisit: Boolean!,
    $desc: String,
    $tags: [String],
    $waitingTime: Int!
    $extras: [ID]
    $duration: Int!
    ) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      scienceClass: $scienceClass,
      desc: $desc,
      grades: $grades,
      remotePlatforms: $remotePlatforms,
      otherRemotePlatformOption: $otherRemotePlatformOption,
      remoteVisit: $remoteVisit,
      inPersonVisit: $inPersonVisit,
      tags: $tags
      waitingTime: $waitingTime
      extras: $extras
      duration: $duration
    ) {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
      start
      end
      tags {
        name,
        id
      }
      visits {
        startTime,
        endTime
      }
      inPersonVisit
      remoteVisit
      desc
      availableTimes {
        startTime,
        endTime
      }
      extras {
        name,
        inPersonLength,
        remoteLength
      }
      duration
    }
  }
`

const ME = gql`
  query me {
    me {
      username,
      isAdmin,
      id
    }
  }
`

const GET_ALL_EXTRAS = gql`
  query {
    getExtras {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

const CREATE_EXTRA = gql`
  mutation createExtra(
      $name: String!
      $classes: [Int]!
      $remoteLength: Int!
      $inPersonLength: Int!
    ) {
    createExtra (
    name: $name
    classes: $classes
    remoteLength: $remoteLength
    inPersonLength: $inPersonLength
    ) {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

const USERS = gql`
  query getUsers {
    getUsers {
      username,
      isAdmin,
      id
    }
  }
`

const createTimeList = (startList, endList) => {
  const timeList = []
  startList.forEach((start, index) => {
    timeList.push({
      start: getUnixTime(createDate(start[0], start[1])),
      end: getUnixTime(createDate(endList[index][0], endList[index][1]))
    })
  })
  return timeList
}

const createAvailableList = (timeList) => {
  const newList = timeList.map(time => {
    return {
      start: getUnixTime(new Date(time.startTime)),
      end: getUnixTime(new Date(time.endTime))
    }
  })
  return newList
}

const UPDATE_EVENT = gql`
  mutation modifyEvent(
    $event: ID!
    $title: String
    $scienceClass: [Int]
    $grades: [Int]
    $remotePlatforms: [Int]
    $otherRemotePlatformOption: String
    $desc: String
    $inPersonVisit: Boolean
    $remoteVisit: Boolean
    $extras: [ID]
    $tags:[String]
    $start:String
    $end:String
    $customForm: ID
    $group: ID
  ) {
    modifyEvent(
      event: $event
      title: $title
      resourceids: $scienceClass
      grades: $grades
      remotePlatforms: $remotePlatforms
      otherRemotePlatformOption: $otherRemotePlatformOption
      desc: $desc
      inPersonVisit: $inPersonVisit
      remoteVisit: $remoteVisit
      extras: $extras
      tags: $tags
      start: $start
      end: $end
      customForm: $customForm
      group: $group
    ) {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
      inPersonVisit
      remoteVisit
      desc
      start
      end
      availableTimes {
        startTime,
        endTime
      }
      extras {
        name,
        inPersonLength,
        remoteLength,
        id
      }
      tags {
        name,
        id
      }
      customForm
      disabled
      group {
        id
        name
      }
    }
  }
`

const GET_ALL_FORMS = gql`
  query {
    getForms {
      id
      name
      fields
    }
  }
`

const GET_FORM = gql`
  query getForm($id: ID!) {
    getForm(id: $id) {
      id
      name
      fields
    }
  }
`

const CREATE_FORM = gql`
  mutation createForm($name: String!, $fields: String) {
    createForm(
      name: $name
      fields: $fields
    ) {
      id
      name
      fields
    }
  }
`

const UPDATE_FORM = gql`
  mutation updateForm($id: ID!, $name: String!, $fields: String) {
    updateForm(
      id: $id
      name: $name
      fields: $fields
    ) {
      id
      name
      fields
    }
  }
`

const DELETE_FORM = gql`
  mutation deleteForm($id: ID!) {
    deleteForm(
      id: $id
    )
  }
`

const RESET_PASSWORD = gql`
  mutation resetPassword($user: ID!, $password: String!) {
    resetPassword(
      user: $user
      password: $password
    ) {
      id
    }
  } 
`

const CHANGE_USERNAME = gql`
  mutation changeUsername($user: ID!, $username: String!, $isAdmin: Boolean!) {
    changeUsername(
      user: $user
      username: $username
      isAdmin: $isAdmin
    ) {
      id
    }
  }
`

const LOCK_EVENT = gql`
  mutation lockEvent($event: ID!) {
    lockEvent(
      event: $event
    ) {
      token
    }
  }
`

const UNLOCK_EVENT = gql`
  mutation unlockEvent($event: ID!) {
    unlockEvent(
      event: $event
    ) {
      id
    }
  }
`

const FORCE_DELETE_EVENTS = gql`
  mutation forceDeleteEvents($events: [ID], $password: String!) {
    forceDeleteEvents(
      events: $events
      password: $password
    ) {
      id
    }
  }
`

const GET_GROUPS = gql`
  query getGroups {
    getGroups {
      id
      name
      events {
        id
        title
        resourceids
        grades
        remotePlatforms
        otherRemotePlatformOption
        start
        end
      }
      maxCount
      visitCount
      publishDate
      disabled
    }
  }
`

const CREATE_GROUP = gql`
  mutation createGroup (
    $name: String!
    $maxCount: Int!
    $publishDate: String
  ) {
    createGroup(
      name: $name
      maxCount: $maxCount
      publishDate: $publishDate
    ) {
      id
      name
    }
  }
`

const DELETE_GROUP = gql`
  mutation deleteGroup(
    $group: ID!
  ) {
    deleteGroup(
      group: $group
    )
  }
`

const ASSIGN_EVENTS_TO_GROUP = gql`
  mutation assignEventsToGroup(
    $events: [ID]
    $group: ID!
  ) {
    assignEventsToGroup(
      group: $group
      events: $events
    ) {
      id
      title
    }
  }
`

const UPDATE_GROUP = gql`
  mutation modifyGroup(
    $id: ID!
    $name: String
    $maxCount: Int
    $publishDate: String
    $disabled: Boolean
  ) {
    modifyGroup(
      id: $id
      name: $name
      maxCount: $maxCount
      publishDate: $publishDate
      disabled: $disabled
    ) {
      id
      name
      publishDate
      maxCount
    }
  }
`

module.exports = {
  LOGIN,
  GET_ALL_VISITS,
  GET_ALL_EVENTS,
  FIND_VISIT,
  CREATE_VISIT,
  CANCEL_VISIT,
  CREATE_EVENT,
  GET_ALL_EXTRAS,
  CREATE_EXTRA,
  CREATE_USER,
  USERS,
  ME,
  GET_ALL_FORMS,
  GET_FORM,
  UPDATE_EVENT,
  CREATE_FORM,
  UPDATE_FORM,
  DELETE_FORM,
  RESET_PASSWORD,
  CHANGE_USERNAME,
  LOCK_EVENT,
  UNLOCK_EVENT,
  FORCE_DELETE_EVENTS,
  GET_GROUPS,
  ASSIGN_EVENTS_TO_GROUP,
  DELETE_GROUP,
  UPDATE_GROUP,
  CREATE_GROUP,
  createTimeList,
  createAvailableList,
  createDate,
}
