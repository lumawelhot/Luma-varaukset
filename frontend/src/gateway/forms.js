import { CREATE_FORM, GET_ALL_FORMS, MODIFY_FORM, DELETE_FORMS } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchAll = async () => (await query({
  query: GET_ALL_FORMS,
  field: 'getForms'
}))?.map(f => ({ ...f, fields: JSON.parse(f.fields) }))

export const add = variables => mutate({
  mutation: CREATE_FORM,
  variables,
  field: 'createForm'
})

export const modify = variables => mutate({
  mutation: MODIFY_FORM,
  variables,
  field: 'updateForm'
})

export const remove = ids => mutate({
  mutation: DELETE_FORMS,
  variables: { ids },
  field: 'deleteForms'
})
