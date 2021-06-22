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
      isAdmin
    }
  }
`

export const EVENTS = gql`
  query getEvents {
    getEvents {
      id
      title
      resourceId
      grades
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
        resourceId
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      extra
      status
      startTime
      endTime
    }
  }
`

export const CURRENT_USER = gql`
  query me {
    me {
      username,
      isAdmin
    }
  }
`

export const CREATE_EVENT = gql`
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: String!, $grades: [Int]!, $remoteVisit: Boolean!, $inPersonVisit: Boolean!, $desc: String, $tags: [TagInput]) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      class: $scienceClass,
      desc: $desc,
      grades: $grades,
      remoteVisit: $remoteVisit,
      inPersonVisit: $inPersonVisit,
      tags: $tags
    ) {
      id
      title
      resourceId
      grades
      start
      end
      tags {
        name,
        id
      }
      inPersonVisit
      remoteVisit
      desc
      availableTimes {
        startTime,
        endTime
      }
    }
  }
`

export const CREATE_VISIT = gql`
  mutation createVisit(
    $event: ID!,
    $clientName: String!,
    $schoolName: String!,
    $schoolLocation: String!,
    $clientEmail: String!,
    $clientPhone: String!,
    $grade: String!,
    $participants: Int!,
    $inPersonVisit: Boolean!,
    $remoteVisit: Boolean!
    $username: String
    ) {
    createVisit(
      event: $event,
      clientName: $clientName,
      schoolName: $schoolName,
      schoolLocation: $schoolLocation,
      clientEmail: $clientEmail,
      clientPhone: $clientPhone,
      startTime: $startTime,
      endTime: $endTime
      clientPhone: $clientPhone
      grade: $grade,
      participants: $participants
      inPersonVisit: $inPersonVisit
      remoteVisit: $remoteVisit 
      participants: $participants,
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
        resourceId
        start
        end
      }
      grade
      startTime
      endTime
      participants
      inPersonVisit
      remoteVisit
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