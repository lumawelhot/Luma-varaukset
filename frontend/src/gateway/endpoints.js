import { mutate, query } from './connector'
import * as _Q from '../graphql/queries'

export const eventGate = {
  fetchAll: () => query(_Q.EVENTS, { field: 'getEvents' }),
  fetch: id => query(_Q.EVENT, { variables: { id }, field: 'getEvent' }),
  add: variables => mutate(_Q.CREATE_EVENTS, { variables, field: 'createEvents' }),
  modify: variables => mutate(_Q.MODIFY_EVENT, { variables, field: 'modifyEvent' }),
  remove: ids => mutate(_Q.DELETE_EVENTS, { variables: { ids }, field: 'deleteEvents' }),
  forceRemove: variables => mutate(_Q.FORCE_DELETE_EVENTS, { variables, field: 'forceDeleteEvents' }),
  assignToGroup: variables => mutate(_Q.ASSIGN_EVENTS_TO_GROUP, { variables, field: 'assignEventsToGroup' }),
  setPublish: variables => mutate(_Q.ASSIGN_PUBLISH_DATE_TO_EVENTS, { variables, field: 'assignPublishDateToEvents' }),
  disable: id => mutate(_Q.DISABLE_EVENT, { variables: { event: id }, field: 'disableEvent' }),
  enable: id => mutate(_Q.ENABLE_EVENT, { variables: { event: id }, field: 'enableEvent' }),
  lock: id => mutate(_Q.LOCK_EVENT, { variables: { event: id }, field: 'lockEvent' }),
  unlock: id => mutate(_Q.UNLOCK_EVENT, { variables: { event: id }, field: 'unlockEvent' }),
}

export const visitGate = {
  fetchAll: async () => (await query(_Q.VISITS, { field: 'getVisits' }))
    ?.map(v => {
      const data = v?.customFormData
      return { ...v, customFormData: typeof data === 'string' ? JSON.parse(data) : data }
    }),
  add: async variables => {
    const visit = await mutate(_Q.CREATE_VISIT, { variables, field: 'createVisit' })
    if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
  },
  modify: async variables => {
    const visit = await mutate(_Q.MODIFY_VISIT, { variables, field: 'modifyVisit' })
    if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
  },
  remove: id => mutate(_Q.CANCEL_VISIT, { variables: { id }, field: 'cancelVisit' }),
  fetch: async id => {
    const visit = await mutate(_Q.FIND_VISIT, { variables: { id }, field: 'findVisit' })
    if (visit) return { ...visit, customFormData: JSON.parse(visit?.customFormData) }
  }
}

export const extraGate = {
  fetchAll: () => query(_Q.EXTRAS, { field: 'getExtras' }),
  add: variables => mutate(_Q.CREATE_EXTRA, { variables, field: 'createExtra' }),
  modify: variables => mutate(_Q.MODIFY_EXTRA, { variables, field: 'modifyExtra' }),
  remove: ids => mutate(_Q.DELETE_EXTRAS, { variables: { ids }, field: 'deleteExtras' }),
}

export const groupGate = {
  fetchAll: () => query(_Q.GROUPS, { field: 'getGroups' }),
  add: variables => mutate(_Q.CREATE_GROUP, { variables, field: 'createGroup' }),
  modify: variables => mutate(_Q.MODIFY_GROUP, { variables, field: 'modifyGroup' }),
  remove: ids => mutate(_Q.DELETE_GROUPS, { variables: { ids }, field: 'deleteGroups' }),
}

export const miscGate = {
  fetchTags: () => query(_Q.TAGS, { field: 'getTags' }),
  fetchEmails: () => query(_Q.GET_EMAIL_TEMPLATES, { field: 'getEmailTemplates' }),
  modifyEmail: variables => mutate(_Q.UPDATE_EMAIL, { variables, field: 'updateEmail' })
}

export const userGate = {
  fetch: () => query(_Q.CURRENT_USER, { field: 'me' }),
  fetchAll: () => query(_Q.USERS, { field: 'getUsers' }),
  add: variables => mutate(_Q.CREATE_USER, { variables, field: 'createUser' }),
  modify: variables => mutate(_Q.MODIFY_USER, { variables, field: 'updateUser' }),
  remove: ids => mutate(_Q.DELETE_USERS, { variables: { ids }, field: 'deleteUsers' }),
  login: variables => mutate(_Q.LOGIN, { variables, field: 'login' })
}

export const formGate = {
  fetchAll: async () => (await query(_Q.GET_ALL_FORMS, { field: 'getForms' }))
    ?.map(f => ({ ...f, fields: JSON.parse(f.fields) })),
  add: variables => mutate(_Q.CREATE_FORM, { variables, field: 'createForm' }),
  modify: variables => mutate(_Q.MODIFY_FORM, { variables, field: 'updateForm' }),
  remove: ids => mutate(_Q.DELETE_FORMS, { variables: { ids }, field: 'deleteForms' })
}
