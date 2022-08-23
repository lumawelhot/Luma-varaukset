import { CREATE_USER, CURRENT_USER, DELETE_USERS, LOGIN, MODIFY_USER, USERS } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetch = () => query({
  query: CURRENT_USER,
  field: 'me'
})

export const fetchAll = () => query({
  query: USERS,
  field: 'getUsers'
})

export const add = variables => mutate({
  mutation: CREATE_USER,
  variables,
  field: 'createUser'
})

export const modify = variables => mutate({
  mutation: MODIFY_USER,
  variables,
  field: 'updateUser'
})

export const remove = ids => mutate({
  mutation: DELETE_USERS,
  variables: { ids },
  field: 'deleteUsers'
})

export const login = variables => mutate({
  mutation: LOGIN,
  variables,
  field: 'login'
})
