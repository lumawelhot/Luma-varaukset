import { gql } from '@apollo/client'
import { EVENT_FIELDS, VISIT_FIELDS } from './fragments'

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(
      username: $username,
      password: $password
    ) {
      value
    }
  }
`

export const CREATE_USER = gql`
  mutation createUser($username: String!, $password: String!, $isAdmin: Boolean!) {
    createUser(
      username: $username,
      password: $password,
      isAdmin: $isAdmin
    ) {
      username,
      isAdmin,
      id
    }
  }
`

export const USERS = gql`
  query getUsers {
    getUsers {
      username,
      isAdmin,
      id
    }
  }
`

export const EVENTS = gql`
  ${EVENT_FIELDS}
  query getEvents {
    getEvents {
      ...EventFields
    }
  }
`

export const EVENT = gql`
  ${EVENT_FIELDS}
  query getEvent($id: ID!) {
    getEvent(
      id: $id
    ) {
      ...EventFields
    }
  }
`

export const TAGS = gql`
  query getTags {
    getTags {
      name
      id
    }
  }
`

export const VISITS = gql`
  ${VISIT_FIELDS}
  query getVisits {
    getVisits {
      ...VisitFields
    }
  }
`

export const CURRENT_USER = gql`
  query me {
    me {
      username,
      isAdmin,
      id
    }
  }
`

export const CREATE_EVENTS = gql`
  ${EVENT_FIELDS}
  mutation createEvents(
    $title: String!,
    $dates: [String]!,
    $start: String!,
    $end: String!,
    $resourceids: [Int]!,
    $grades: [Int]!,
    $remotePlatforms: [Int],
    $otherRemotePlatformOption: String,
    $remoteVisit: Boolean!,
    $inPersonVisit: Boolean!,
    $desc: String,
    $tags: [String],
    $waitingTime: Int!
    $extras: [ID]
    $duration: Int!,
    $customForm: ID,
    $group: ID,
    $publishDate: String
    $languages: [String]
    ) {
    createEvents (
      title: $title,
      dates: $dates,
      start: $start,
      end: $end,
      scienceClass: $resourceids,
      desc: $desc,
      grades: $grades,
      remotePlatforms: $remotePlatforms,
      otherRemotePlatformOption: $otherRemotePlatformOption,
      remoteVisit: $remoteVisit,
      inPersonVisit: $inPersonVisit,
      tags: $tags
      waitingTime: $waitingTime
      extras: $extras
      duration: $duration
      customForm: $customForm
      group: $group
      publishDate: $publishDate
      languages: $languages
    ) {
      ...EventFields
    }
  }
`

export const CREATE_VISIT = gql`
  ${VISIT_FIELDS}
  mutation createVisit(
    $event: ID!
    $clientName: String!
    $schoolName: String!
    $schoolLocation: String!
    $clientEmail: String!
    $clientPhone: String!
    $grade: String!
    $participants: Int!
    $inPersonVisit: Boolean!
    $remoteVisit: Boolean!
    $startTime: String!
    $endTime: String!
    $dataUseAgreement: Boolean!
    $extras: [ID]
    $remotePlatform: String
    $token: String!
    $customFormData: String
    $language: String
    ) {
    createVisit(
      event: $event
      clientName: $clientName
      schoolName: $schoolName
      schoolLocation: $schoolLocation
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      startTime: $startTime
      endTime: $endTime
      grade: $grade
      participants: $participants
      inPersonVisit: $inPersonVisit
      remoteVisit: $remoteVisit
      dataUseAgreement: $dataUseAgreement
      extras: $extras
      remotePlatform: $remotePlatform
      token: $token
      customFormData: $customFormData
      language: $language
    ) {
      ...VisitFields
    }
  }
`
export const FIND_VISIT = gql`
  ${VISIT_FIELDS}
  query findVisit($id: ID!) {
    findVisit(id: $id) {
      ...VisitFields
    }
  }
`

export const CANCEL_VISIT = gql`
  mutation cancelVisit($id: ID!) {
    cancelVisit(id: $id) {
      id
    }
  }
`

export const EXTRAS = gql`
  query getExtras {
    getExtras {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

export const CREATE_EXTRA = gql`
  mutation createExtra(
      $name: String!
      $classes: [Int]!
      $remoteLength: Int!
      $inPersonLength: Int!
    ) {
    createExtra (
      name: $name
      classes: $classes
      remoteLength: $remoteLength
      inPersonLength: $inPersonLength
    ) {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

export const MODIFY_EXTRA = gql`
  mutation moidfyExtra(
      $id: ID!
      $name: String!
      $classes: [Int]!
      $remoteLength: Int!
      $inPersonLength: Int!
    ) {
    modifyExtra (
      id: $id  
      name: $name
      classes: $classes
      remoteLength: $remoteLength
      inPersonLength: $inPersonLength
    ) {
      id
      name
      classes
      remoteLength
      inPersonLength
    }
  }
`

export const DELETE_EXTRAS = gql`
  mutation deleteExtras(
    $ids: [String]!
  ) {
    deleteExtras(
      ids: $ids
    )
  }
`

export const DELETE_EVENTS = gql`
  mutation deleteEvents(
    $ids: [ID]!
  ) {
    deleteEvents(
      ids: $ids
    )
  }
`

export const DELETE_USERS = gql`
  mutation deleteUsers(
    $ids: [ID]!
  ) {
    deleteUsers(
      ids: $ids
    )
  }
`

export const MODIFY_EVENT = gql`
  ${EVENT_FIELDS}
  mutation modifyEvent(
    $event: ID!
    $title: String
    $resourceids: [Int]
    $grades: [Int]
    $remotePlatforms: [Int]
    $otherRemotePlatformOption: String
    $desc: String
    $inPersonVisit: Boolean
    $remoteVisit: Boolean
    $extras: [ID]
    $tags:[String]
    $start:String
    $end:String
    $customForm: ID
    $group: ID
    $publishDate: String
    $languages: [String]
  ) {
    modifyEvent(
      event: $event
      title: $title
      resourceids: $resourceids
      grades: $grades
      remotePlatforms: $remotePlatforms
      otherRemotePlatformOption: $otherRemotePlatformOption
      desc: $desc
      inPersonVisit: $inPersonVisit
      remoteVisit: $remoteVisit
      extras: $extras
      tags: $tags
      start: $start
      end: $end
      customForm: $customForm
      group: $group
      publishDate: $publishDate
      languages: $languages
    ) {
      ...EventFields
    }
  }
`

export const DISABLE_EVENT = gql `
  mutation disableEvent(
    $event: ID!
  ) {
    disableEvent(
      event: $event
    ) {
      id
      disabled
    }
  }
`

export const ENABLE_EVENT = gql `
  mutation enableEvent(
    $event: ID!
  ) {
    enableEvent(
      event: $event
    ) {
      id
      disabled
    }
  }
`

export const GET_ALL_FORMS = gql`
  query getForms{
    getForms {
      id
      name
      fields
    }
  }
`

export const GET_EMAIL_TEMPLATES = gql`
  query getEmailTemplates {
    getEmailTemplates {
      subject
      html
      text
      name
      ad
      adSubject
      adText
    }
  }
`

export const CREATE_FORM = gql`
  mutation createForm($name: String!, $fields: String) {
    createForm(
      name: $name
      fields: $fields
    ) {
      id
      name
      fields
    }
  }
`

export const MODIFY_FORM = gql`
  mutation updateForm($id: ID!, $name: String!, $fields: String) {
    updateForm(
      id: $id
      name: $name
      fields: $fields
    ) {
      id
      name
      fields
    }
  }
`

export const DELETE_FORMS = gql`
  mutation deleteForms($ids: [ID]!) {
    deleteForms(
      ids: $ids
    )
  }
`

export const MODIFY_USER = gql`
  mutation updateUser($user: ID!, $password: String, $username: String!, $isAdmin: Boolean!) {
    updateUser(
      user: $user
      password: $password
      username: $username
      isAdmin: $isAdmin
    ) {
      id
      username
      isAdmin
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation resetPassword($user: ID!, $password: String!) {
    resetPassword(
      user: $user
      password: $password
    ) {
      id
    }
  } 
`

export const CHANGE_USERNAME = gql`
  mutation changeUsername($user: ID!, $username: String!, $isAdmin: Boolean!) {
    changeUsername(
      user: $user
      username: $username
      isAdmin: $isAdmin
    ) {
      id
    }
  }
`

export const LOCK_EVENT = gql`
  mutation lockEvent($event: ID!) {
    lockEvent(
      event: $event
    ) {
      token
    }
  }
`

export const UNLOCK_EVENT = gql`
  mutation unlockEvent($event: ID!) {
    unlockEvent(
      event: $event
    ) {
      id
    }
  }
`

export const EVENT_STATUS = gql`
  subscription {
    eventModified {
      id
    }
  }
`

export const EVENTS_DELETED = gql`
  subscription {
    eventsDeleted {
      id
    }
  }
`

export const FORCE_DELETE_EVENTS = gql`
  mutation forceDeleteEvents($events: [ID], $password: String!) {
    forceDeleteEvents(
      events: $events
      password: $password
    ) {
      id
    }
  }
`

export const UPDATE_EMAIL = gql`
  mutation updateEmail(
    $name: String!,
    $subject: String!, 
    $html: String!, 
    $text: String!, 
    $ad: [String]!, 
    $adSubject: String!, 
    $adText: String!
  ) {
    updateEmail(
      name: $name
      subject: $subject
      html: $html
      text: $text
      ad: $ad
      adSubject: $adSubject
      adText: $adText
    ) {
      subject
      html
      text
      name
      ad
      adSubject
      adText
    }
  }
`

export const GROUPS = gql`
  query getGroups {
    getGroups {
      id
      name
      events {
        id
        title
      }
      maxCount
      visitCount
      publishDate
      disabled
    }
  }
`

export const CREATE_GROUP = gql`
  mutation createGroup (
    $name: String!
    $maxCount: Int!
    $publishDate: String
  ) {
    createGroup(
      name: $name
      maxCount: $maxCount
      publishDate: $publishDate
    ) {
      id
      name
      events {
        id
        title
      }
      maxCount
      visitCount
      publishDate
      disabled
    }
  }
`

export const DELETE_GROUPS = gql`
  mutation deleteGroups(
    $ids: [ID]!
  ) {
    deleteGroups(
      ids: $ids
    )
  }
`

export const ASSIGN_EVENTS_TO_GROUP = gql`
  mutation assignEventsToGroup(
    $events: [ID]
    $group: ID!
  ) {
    assignEventsToGroup(
      group: $group
      events: $events
    ) {
      id
      title
    }
  }
`

export const ASSIGN_PUBLISH_DATE_TO_EVENTS = gql `
  mutation assignPublishDateToEvents(
    $events: [ID]
    $publishDate: String
  ) {
    assignPublishDateToEvents(
      publishDate: $publishDate
      events: $events
    ) {
      id
      title
      publishDate
    }
  }
`

export const MODIFY_GROUP = gql`
  mutation modifyGroup(
    $id: ID!
    $name: String
    $maxCount: Int
    $publishDate: String
    $disabled: Boolean
  ) {
    modifyGroup(
      id: $id
      name: $name
      maxCount: $maxCount
      publishDate: $publishDate
      disabled: $disabled
    ) {
      id
      name
      events {
        id
        title
      }
      maxCount
      visitCount
      publishDate
      disabled
    }
  }
`