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

export const CURRENT_USER = gql`
  query me {
    me {
      username,
      isAdmin
    }
  }
`

export const CREATE_EVENT = gql`
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: String!, $grades: [Int]!, $desc: String, $tags: [TagInput]) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      class: $scienceClass,
      desc: $desc,
      grades: $grades,
      tags: $tags
    ) {
      title
      resourceId
      grades
      start
      end
      tags {
        name,
        id
      }
      booked
    }
  }
`

export const CREATE_VISIT = gql`
  mutation createVisit($event: ID!, $grade: Int!, $clientName: String!, $clientEmail: String!, $clientPhone: String!) {
    createVisit(
      event: $event,
      grade: $grade,
      clientName: $clientName,
      clientEmail: $clientEmail,
      clientPhone: $clientPhone
    ) {
      id
      event {
        id
        title
        booked
      }
      grade
      clientName
      clientEmail
      clientPhone
      pin
    }
  }
`
export const FIND_VISIT = gql`
  query findVisit($id: ID!, $pin: Int!) {
    findVisit(id: $id, pin: $pin) {
      clientName
      clientEmail
      clientPhone
      event {
        title
        resourceId
        start
        end
      }
      grade
    }
  }
`

export const CANCEL_VISIT = gql`
  mutation cancelVisit($id: ID!, $pin: Int!) {
    cancelVisit(id: $id, pin: $pin) {
      id
    }
  }
`