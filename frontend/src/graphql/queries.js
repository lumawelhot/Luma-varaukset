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
      title
      resourceId
      grades
      tags {
        id
        name
      }
      start
      end
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

export const CREATE_EVENT = gql `
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: String!, $grades: [Int]!, $tags: [Tag]) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      class: $scienceClass,
      grades: $grades,
      tags: $tags
    ) {
      title
      resourceId
      grades
      tags {
        name,
        id
      }
    }
  }
`