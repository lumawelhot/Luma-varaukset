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
      start
      end
      description
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

<<<<<<< HEAD
export const CREATE_EVENT = gql `
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: String!, $description: String) {
=======
export const CREATE_EVENT = gql`
  mutation createEvent($title: String!, $start: String!, $end: String!, $scienceClass: String!, $grades: [Int]!) {
>>>>>>> origin/main
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      class: $scienceClass,
<<<<<<< HEAD
      description: $description
=======
      grades: $grades
>>>>>>> origin/main
    ) {
      title
      resourceId
      grades
    }
  }
`