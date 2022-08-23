import { EXTRAS, DELETE_EXTRAS, CREATE_EXTRA, MODIFY_EXTRA } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchAll = () => query({
  query: EXTRAS,
  field: 'getExtras'
})

export const add = variables => mutate({
  mutation: CREATE_EXTRA,
  variables,
  field: 'createExtra'
})

export const modify = variables => mutate({
  mutation: MODIFY_EXTRA,
  variables,
  field: 'modifyExtra'
})

export const remove = ids => mutate({
  mutation: DELETE_EXTRAS,
  variables: { ids },
  field: 'deleteExtras'
})
