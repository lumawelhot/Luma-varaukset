import { CREATE_GROUP, DELETE_GROUPS, GROUPS, MODIFY_GROUP } from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchAll = () => query({
  query: GROUPS,
  field: 'getGroups'
})

export const add = variables => mutate({
  mutation: CREATE_GROUP,
  variables,
  field: 'createGroup'
})

export const modify = variables => mutate({
  mutation: MODIFY_GROUP,
  variables,
  field: 'modifyGroup'
})

export const remove = ids => mutate({
  mutation: DELETE_GROUPS,
  variables: { ids },
  field: 'deleteGroups'
})
