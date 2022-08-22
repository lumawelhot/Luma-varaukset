import { client } from '..'
import { EXTRAS, DELETE_EXTRAS, CREATE_EXTRA, MODIFY_EXTRA } from '../graphql/queries'

export const fetchAll = async () => {
  try {
    const { data: { getExtras } } = await client.query({
      query: EXTRAS,
      fetchPolicy: 'no-cache'
    })
    return getExtras
  } catch (err) { undefined }
}

export const add = async variables => {
  try {
    const { data: { createExtra } } = await client.mutate({
      mutation: CREATE_EXTRA,
      variables,
      fetchPolicy: 'no-cache'
    })
    return createExtra
  } catch (err) { undefined }
}

export const modify = async variables => {
  try {
    const { data: { modifyExtra } } = await client.mutate({
      mutation: MODIFY_EXTRA,
      variables,
      fetchPolicy: 'no-cache'
    })
    return modifyExtra
  } catch (err) { undefined}
}

export const remove = async ids => {
  try {
    const { data: { deleteExtras } } = await client.mutate({
      mutation: DELETE_EXTRAS,
      variables: { ids },
      fetchPolicy: 'no-cache'
    }
    )
    return deleteExtras
  } catch (err) { undefined }
}
