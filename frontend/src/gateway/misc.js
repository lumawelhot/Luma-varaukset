import { TAGS, GET_EMAIL_TEMPLATES, UPDATE_EMAIL } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchTags = () => query({
  query: TAGS,
  field: 'getTags'
})

export const fetchEmails = () => query({
  query: GET_EMAIL_TEMPLATES,
  field: 'getEmailTemplates'
})

export const modifyEmail = variables => mutate({
  mutation: UPDATE_EMAIL,
  variables,
  field: 'updateEmail'
})
