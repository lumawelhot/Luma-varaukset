import { client } from '..'
import { VISITS, CANCEL_VISIT, FIND_VISIT, CREATE_VISIT, MODIFY_VISIT } from '../graphql/queries'

export const fetchAll = async () => {
  try {
    const { data: { getVisits } } = await client.query({
      query: VISITS,
      fetchPolicy: 'no-cache'
    })
    return getVisits.map(v => {
      const data = v?.customFormData
      return {
        ...v,
        customFormData: typeof data === 'string' ? JSON.parse(data) : data
      }
    })
  } catch (err) { undefined }
}

export const add = async variables => {
  try {
    const { data: { createVisit } } = await client.mutate({
      mutation: CREATE_VISIT,
      variables,
      fetchPolicy: 'no-cache'
    })
    return { ...createVisit, customFormData: JSON.parse(createVisit?.customFormData) }
  } catch (err) { undefined }
}

export const remove = async id => {
  try {
    const { data: { cancelVisit } } = await client.mutate({
      mutation: CANCEL_VISIT,
      variables: { id },
      fetchPolicy: 'no-cache'
    })
    return cancelVisit
  } catch (err) { undefined }
  return false
}

export const modify = async variables => {
  try {
    const { data: { modifyVisit } } = await client.mutate({
      mutation: MODIFY_VISIT,
      variables,
      fetchPolicy: 'no-cache'
    })
    return { ...modifyVisit, customFormData: JSON.parse(modifyVisit?.customFormData) }
  } catch (err) { undefined }
}

export const fetch = async id => {
  try {
    const { data: { findVisit } } = await client.query({
      query: FIND_VISIT,
      variables: { id },
      fetchPolicy: 'no-cache'
    })
    return { ...findVisit, customFormData: JSON.parse(findVisit?.customFormData) }
  } catch (err) { console.log(err) }
  return false
}
