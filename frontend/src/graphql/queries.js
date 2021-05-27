import { gql } from '@apollo/client'

export const LOGIN = gql `
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

export const CREATE_USER = gql `
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

export const USERS = gql `
  query getUsers {
    getUsers {
      username,
      isAdmin
    }
  }
`

export const EVENTS = gql `
  query getEvents {
    getEvents {
      title
      resourceId
      start
      end
    }
  }
`
export const CURRENT_USER = gql `
  query me {
    me {
      username,
      isAdmin
    }
  }
`