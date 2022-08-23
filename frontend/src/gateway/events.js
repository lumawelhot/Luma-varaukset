import {
  EVENTS,
  CREATE_EVENTS,
  MODIFY_EVENT,
  DELETE_EVENTS,
  EVENT,
  FORCE_DELETE_EVENTS,
  ASSIGN_EVENTS_TO_GROUP,
  ASSIGN_PUBLISH_DATE_TO_EVENTS,
  DISABLE_EVENT,
  ENABLE_EVENT,
  LOCK_EVENT,
  UNLOCK_EVENT,
} from '../graphql/queries'
import { mutate, query } from './connector'

export const fetchAll = () => query({
  query: EVENTS,
  field: 'getEvents'
})

export const fetch = id => query({
  query: EVENT,
  variables: { id },
  field: 'getEvent'
})

export const add = variables => mutate({
  mutation: CREATE_EVENTS,
  variables,
  field: 'createEvents'
})

export const modify = variables => mutate({
  mutation: MODIFY_EVENT,
  variables,
  field: 'modifyEvent'
})

export const remove = ids => mutate({
  mutation: DELETE_EVENTS,
  variables: { ids },
  field: 'deleteEvents'
})

export const forceRemove = variables => mutate({
  mutation: FORCE_DELETE_EVENTS,
  variables,
  field: 'forceDeleteEvents'
})

export const assignToGroup = variables => mutate({
  mutation: ASSIGN_EVENTS_TO_GROUP,
  variables,
  field: 'assignEventsToGroup'
})

export const setPublish = variables => mutate({
  mutation: ASSIGN_PUBLISH_DATE_TO_EVENTS,
  variables,
  field: 'assignPublishDateToEvents'
})

export const disable = id => mutate({
  mutation: DISABLE_EVENT,
  variables: { event: id },
  field: 'disableEvent'
})

export const enable = id => mutate({
  mutation: ENABLE_EVENT,
  variables: { event: id },
  field: 'enableEvent'
})

export const lock = id => mutate({
  mutation: LOCK_EVENT,
  variables: { event: id },
  field: 'lockEvent'
})

export const unlock = id => mutate({
  mutation: UNLOCK_EVENT,
  variables: { event: id },
  field: 'unlockEvent'
})
