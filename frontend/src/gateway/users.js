import { client } from '..'
import { CREATE_USER, CURRENT_USER, DELETE_USERS, LOGIN, MODIFY_USER, USERS } from '../graphql/queries'

export const fetch = async () => {
  try {
    const { data: { me } } = await client.query({
      query: CURRENT_USER,
      fetchPolicy: 'no-cache'
    })
    return me
  } catch (err) { undefined }
}

export const fetchAll = async () => {
  try {
    const { data: { getUsers } } = await client.query({
      query: USERS,
      fetchPolicy: 'no-cache'
    })
    return getUsers
  } catch (err) { undefined }
}

export const add = async variables => {
  try {
    const { data: { createUser } } = await client.mutate({
      mutation: CREATE_USER,
      variables,
      fetchPolicy: 'no-cache'
    })
    return createUser
  } catch (err) { undefined }
}

export const modify = async variables => {
  try {
    const { data: { updateUser } } = await client.mutate({
      mutation: MODIFY_USER,
      variables,
      fetchPolicy: 'no-cache'
    })
    return updateUser
  } catch (err) { undefined }
}

export const remove = async ids => {
  try {
    const { data: { deleteUsers } } = await client.mutate({
      mutation: DELETE_USERS,
      variables: { ids },
      fetchPolicy: 'no-cache'
    })
    return deleteUsers
  } catch (err) { undefined }
}

export const login = async (variables) => {
  try {
    const { data: { login } } = await client.mutate({
      mutation: LOGIN,
      variables,
      fetchPolicy: 'no-cache'
    })
    return login.value
  } catch (err) { undefined }
}
