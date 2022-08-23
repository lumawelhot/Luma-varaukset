import { VISITS, CANCEL_VISIT, FIND_VISIT, CREATE_VISIT, MODIFY_VISIT } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchAll = async () => (await query({
  query: VISITS,
  field: 'getVisits'
})).map(v => {
  const data = v?.customFormData
  return { ...v, customFormData: typeof data === 'string' ? JSON.parse(data) : data }
})

export const add = async variables => {
  const visit = await mutate({
    mutation: CREATE_VISIT,
    variables,
    field: 'createVisit'
  })
  if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
}

export const modify = async variables => {
  const visit = await mutate({
    mutation: MODIFY_VISIT,
    variables,
    field: 'modifyVisit'
  })
  if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
}

export const remove = id => mutate({
  mutation: CANCEL_VISIT,
  variables: { id },
  field: 'cancelVisit'
})

export const fetch = async id => {
  const visit = await mutate({
    mutation: FIND_VISIT,
    variables: { id },
    field: 'findVisit'
  })
  if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
}
