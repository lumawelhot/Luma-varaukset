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
    $inPersonVisit: Boolean!
    $remoteVisit: Boolean!
    $username: String
    $startTime: String!
    $endTime: String!
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
      grade: $grade
      participants: $participants
      inPersonVisit: $inPersonVisit
      remoteVisit: $remoteVisit
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

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: '1',
  schoolName: 'school',
  schoolLocation: 'Helsinki',
  participants: 13,
  inPersonVisit: true,
  remoteVisit: true
}

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

module.exports = { LOGIN, FIND_VISIT, CREATE_VISIT, CANCEL_VISIT, details, createTimeList, createAvailableList, createDate }
