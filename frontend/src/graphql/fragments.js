import { gql } from '@apollo/client'

export const EVENT_FIELDS = gql`
  fragment EventFields on Event {
    id
    title
    resourceids
    grades
    remotePlatforms
    otherRemotePlatformOption
    waitingTime
    tags {
      id
      name
    }
    start
    end
    desc
    inPersonVisit
    remoteVisit
    availableTimes {
      startTime
      endTime
    }
    visits {
      startTime
      endTime
    }
    extras {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
    duration
    customForm {
      id
      name
      fields
    }
    disabled
    locked
    group {
      id
      name
      disabled
      publishDate
    }
    publishDate
    languages
  }
`

export const VISIT_FIELDS = gql`
  fragment VisitFields on Visit {
    id
    clientName
    schoolName
    schoolLocation
    clientEmail
    clientPhone
    event {
      id
      title
      start
      end
      resourceids
      desc
    }
    extras {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
    grade
    startTime
    endTime
    participants
    inPersonVisit
    remoteVisit
    status
    remotePlatform
    customFormData
    language
  }
`