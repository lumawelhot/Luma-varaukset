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
      resourceids
      grades
      tags {
        id
        name
      }
      start
      end
      desc
      booked
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
      extra
      status
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
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: [Int]!, $grades: [Int]!, $remoteVisit: Boolean!, $inPersonVisit: Boolean!, $desc: String, $tags: [TagInput]) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      scienceClass: $scienceClass,
      desc: $desc,
      grades: $grades,
      remoteVisit: $remoteVisit,
      inPersonVisit: $inPersonVisit,
      tags: $tags
    ) {
      id
      title
      resourceids
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
      booked
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
    $username: String
    ) {
    createVisit(
      event: $event,
      clientName: $clientName,
      schoolName: $schoolName,
      schoolLocation: $schoolLocation,
      clientEmail: $clientEmail,
      clientPhone: $clientPhone
      grade: $grade,
      participants: $participants,
      username: $username
    ) {
      id
      event {
        id
        title
        booked
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
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
        resourceids
        start
        end
      }
      grade
      participants
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