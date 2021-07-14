import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

export const CREATE_USER = gql`
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

export const USERS = gql`
  query getUsers {
    getUsers {
      username,
      isAdmin,
      id
    }
  }
`

export const EVENTS = gql`
  query getEvents {
    getEvents {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
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
        inPersonLength
        remoteLength
      }
      duration
    }
  }
`

export const TAGS = gql`
  query getTags {
    getTags {
      name
      id
    }
  }
`

export const VISITS = gql`
  query getVisits {
    getVisits {
      id
      event {
        id
        title
        resourceids
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      extras {
        id
        name
      }
      status
      startTime
      endTime
      remotePlatform
    }
  }
`

export const CURRENT_USER = gql`
  query me {
    me {
      username,
      isAdmin,
      id
    }
  }
`

export const CREATE_EVENT = gql`
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
        remoteLength,
        id
      }
      duration
    }
  }
`

export const CREATE_VISIT = gql`
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
    $dataUseAgreement: Boolean!
    $extras: [ID]
    $remotePlatform: String
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
      dataUseAgreement: $dataUseAgreement
      extras: $extras
      remotePlatform: $remotePlatform
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
      remotePlatform
      status
    }
  }
`
export const FIND_VISIT = gql`
  query findVisit($id: ID!) {
    findVisit(id: $id) {
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      event {
        title
        start
        end
        resourceids
        desc
      }
      extras {
        id
        name
      }
      grade
      startTime
      endTime
      participants
      inPersonVisit
      remoteVisit
      status
      remotePlatform
    }
  }
`

export const CANCEL_VISIT = gql`
  mutation cancelVisit($id: ID!) {
    cancelVisit(id: $id) {
      id
    }
  }
`

export const EXTRAS = gql`
  query getExtras {
    getExtras {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

export const CREATE_EXTRA = gql`
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

export const DELETE_EXTRA = gql`
  mutation deleteExtra(
    $id: String!
  ) {
    deleteExtra(
      id: $id
    )
  }
`

export const DELETE_EVENT = gql`
  mutation deleteEvent(
    $id: String!
  ) {
    deleteEvent(
      id: $id
    )
  }
`

export const DELETE_USER = gql`
  mutation deleteUser(
    $id: String!
  ) {
    deleteUser(
      id: $id
    )
  }
`

export const UPDATE_EVENT = gql`
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
    $tags:[TagInput]
    $start:String
    $end:String
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
    }
  }
`