import { client } from '..'
import { CREATE_GROUP, DELETE_GROUPS, GROUPS, MODIFY_GROUP } from '../graphql/queries'

export const fetchAll = async () => {
  try {
    const { data: { getGroups } } = await client.query({
      query: GROUPS,
      fetchPolicy: 'no-cache'
    })
    return getGroups
  } catch (err) { undefined }
}

export const add = async variables => {
  try {
    const { data: { createGroup } } = await client.mutate({
      mutation: CREATE_GROUP,
      variables,
      fetchPolicy: 'no-cache'
    })
    return createGroup
  } catch (err) { undefined }
}

export const remove = async ids => {
  try {
    const { data: { deleteGroups } } = await client.mutate({
      mutation: DELETE_GROUPS,
      variables: { ids },
      fetchPolicy: 'no-cache'
    })
    return deleteGroups
  } catch (err) { undefined }
  return false
}

export const modify = async variables => {
  try {
    const { data: { modifyGroup } } = await client.mutate({
      mutation: MODIFY_GROUP,
      variables,
      fetchPolicy: 'no-cache'
    })
    return modifyGroup
  } catch (err) { undefined }
}
