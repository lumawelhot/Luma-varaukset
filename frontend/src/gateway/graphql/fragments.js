import { gql } from '@apollo/client'

export const EXTRA_FIELDS = gql`
  fragment ExtraFields on Extra {
    id
    name
    classes
    remoteLength
    inPersonLength
  }
`

export const EVENT_FIELDS = gql`
  ${EXTRA_FIELDS}
  fragment EventFields on Event {
    id
    title
    resourceids
    grades {
      name
    }
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
    schoolVisit
    availableTimes {
      startTime
      endTime
    }
    visits {
      startTime
      endTime
    }
    extras { ...ExtraFields }
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
    }
    publishDate
    languages
    limits
    closedDays
  }
`

export const VISIT_FIELDS = gql`
  ${EXTRA_FIELDS}
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
    }
    extras { ...ExtraFields }
    grade
    gradeInfo
    startTime
    endTime
    participants
    teaching {
      type
      location
      payload
    }
    status
    customFormData
    language
    created
    cancellation
  }
`
