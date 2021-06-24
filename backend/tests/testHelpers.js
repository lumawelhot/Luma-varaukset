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
    $event: ID!,
    $grade: String!,
    $clientName: String!,
    $schoolName: String!,
    $schoolLocation: String!,
    $participants: Int!,
    $clientEmail: String!,
    $clientPhone: String!,
    $username: String
    $startTime: String!
    $endTime: String!,
    $inPersonVisit: Boolean!,
    $remoteVisit: Boolean!,
    $dataUseAgreement: Boolean!
    ) {
    createVisit(
      event: $event
      grade: $grade
      clientName: $clientName
      schoolName: $schoolName
      schoolLocation: $schoolLocation
      participants: $participants
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      username: $username
      startTime: $startTime
      endTime: $endTime
      inPersonVisit: $inPersonVisit,
      remoteVisit: $remoteVisit,
      dataUseAgreement: $dataUseAgreement
    ) {
      id
      event {
        title
      }
      grade
      clientName
      schoolName
      schoolLocation
      participants
      clientEmail
      clientPhone
      status
      dataUseAgreement
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

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: '1',
  schoolName: 'school',
  schoolLocation: 'Helsinki',
  participants: 13,
  inPersonVisit: true,
  remoteVisit: true,
  dataUseAgreement: true
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
