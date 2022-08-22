import { client } from '..'
import { CREATE_FORM, GET_ALL_FORMS, MODIFY_FORM, DELETE_FORMS } from '../graphql/queries'

export const fetchAll = async () => {
  try {
    const { data: { getForms } } = await client.query({
      query: GET_ALL_FORMS,
      fetchPolicy: 'no-cache'
    })
    return getForms.map(f => ({ ...f, fields: JSON.parse(f.fields) }))
  } catch (err) { undefined }
}

export const add = async variables => {
  try {
    const { data: { createForm } } = await client.mutate({
      mutation: CREATE_FORM,
      variables,
      fetchPolicy: 'no-cache'
    })
    return createForm
  } catch (err) { undefined }
}

export const modify = async variables => {
  try {
    const { data: { updateForm } } = await client.mutate({
      mutation: MODIFY_FORM,
      variables,
      fetchPolicy: 'no-cache'
    })
    return updateForm
  } catch (err) { undefined}
}

export const remove = async ids => {
  try {
    const { data: { deleteForms } } = await client.mutate({
      mutation: DELETE_FORMS,
      variables: { ids },
      fetchPolicy: 'no-cache'
    }
    )
    return deleteForms
  } catch (err) { undefined }
}
