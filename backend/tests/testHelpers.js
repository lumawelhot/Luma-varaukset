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
    $username: String
    $startTime: String!
    $endTime: String!,
    $inPersonVisit: Boolean!,
    $remoteVisit: Boolean!,
    $dataUseAgreement: Boolean!
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
      username: $username
    ) {
      id
      event {
        id
        title
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
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      status
      dataUseAgreement
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
    $tags: [TagInput],
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
  createTimeList,
  createAvailableList,
  createDate,
}
