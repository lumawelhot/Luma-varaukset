const { gql } = require('apollo-server-express')
const setHours = require('date-fns/setHours')
const setMinutes = require('date-fns/setMinutes')
const setSeconds = require('date-fns/setSeconds')
const add = require('date-fns/add')
const { getUnixTime } = require('date-fns')

const createDate = (hours, minutes) => setSeconds(setMinutes(setHours(add(new Date(), { days: 16 }), hours), minutes), 0)

const CANCEL_VISIT = gql `
  mutation cancelVisit($id: ID!) {
    cancelVisit(id: $id) {
      id
      status
    }
  }
`

const CREATE_VISIT = gql `
  mutation createVisit($event: ID!, $clientName: String!, $clientEmail: String!, $clientPhone: String!, $grade: Int!, $startTime: String!, $endTime: String!) {
    createVisit(
      event: $event
      clientName: $clientName
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      grade: $grade
      startTime: $startTime
      endTime: $endTime
    ) {
      id
      event {
        title
      }
      clientName
      clientEmail
      clientPhone
      grade
      status
    }
  }
`

const details = {
  clientName: 'Teacher',
  clientEmail: 'teacher@school.com',
  clientPhone: '040-1234567',
  grade: 1,
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

module.exports = { CREATE_VISIT, CANCEL_VISIT, details, createTimeList, createAvailableList, createDate }