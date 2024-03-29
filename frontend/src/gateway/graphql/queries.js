import { gql } from '@apollo/client'
import { EVENT_FIELDS, EXTRA_FIELDS, VISIT_FIELDS } from './fragments'

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
  query getEvents($ids: [ID]) {
    getEvents(
      ids: $ids
    ) { ...EventFields }
  }
`

export const EVENT = gql`
  ${EVENT_FIELDS}
  query getEvent($id: ID!) {
    getEvent(
      id: $id
    ) { ...EventFields }
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
    getVisits { ...VisitFields }
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
    $grades: [InputGrade]!,
    $remotePlatforms: [Int],
    $otherRemotePlatformOption: String,
    $remoteVisit: Boolean!,
    $inPersonVisit: Boolean!,
    $schoolVisit: Boolean!,
    $desc: String,
    $tags: [String],
    $waitingTime: Int!
    $extras: [ID]
    $duration: Int!,
    $customForm: ID,
    $group: ID,
    $publishDate: String
    $languages: [String]
    $limits: String
    $closedDays: Int
    ) {
    createEvents (
      title: $title,
      dates: $dates,
      start: $start,
      end: $end,
      resourceids: $resourceids,
      desc: $desc,
      grades: $grades,
      remotePlatforms: $remotePlatforms,
      otherRemotePlatformOption: $otherRemotePlatformOption,
      remoteVisit: $remoteVisit,
      inPersonVisit: $inPersonVisit,
      schoolVisit: $schoolVisit,
      tags: $tags
      waitingTime: $waitingTime
      extras: $extras
      duration: $duration
      customForm: $customForm
      group: $group
      publishDate: $publishDate
      languages: $languages
      limits: $limits
      closedDays: $closedDays
    ) { ...EventFields }
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
    $startTime: String!
    $endTime: String!
    $dataUseAgreement: Boolean!
    $extras: [ID]
    $teaching: ITeaching
    $token: String!
    $customFormData: String
    $language: String
    $gradeInfo: String
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
      dataUseAgreement: $dataUseAgreement
      extras: $extras
      teaching: $teaching
      token: $token
      customFormData: $customFormData
      language: $language
      gradeInfo: $gradeInfo
    ) { ...VisitFields }
  }
`

export const MODIFY_VISIT = gql`
  ${VISIT_FIELDS}
  mutation modifyVisit(
    $visit: ID!
    $clientName: String
    $schoolName: String
    $schoolLocation: String
    $clientEmail: String
    $clientPhone: String
    $grade: String
    $participants: Int
    $extras: [ID]
    $teaching: ITeaching
    $customFormData: String
    $language: String
    $dataUseAgreement: Boolean
    $event: ID
    $startTime: String
    $endTime: String
    $gradeInfo: String
    ) {
    modifyVisit(
      visit: $visit
      clientName: $clientName
      schoolName: $schoolName
      schoolLocation: $schoolLocation
      clientEmail: $clientEmail
      clientPhone: $clientPhone
      grade: $grade
      participants: $participants
      dataUseAgreement: $dataUseAgreement
      extras: $extras
      teaching: $teaching
      customFormData: $customFormData
      language: $language
      event: $event
      startTime: $startTime
      endTime: $endTime
      gradeInfo: $gradeInfo
    ) { ...VisitFields }
  }
`

export const FIND_VISIT = gql`
  ${VISIT_FIELDS}
  query findVisit($id: ID!) {
    findVisit(id: $id) { ...VisitFields }
  }
`

export const CANCEL_VISIT = gql`
  mutation cancelVisit($id: ID!, $cancellation: String) {
    cancelVisit(id: $id, cancellation: $cancellation) {
      id
    }
  }
`

export const EXTRAS = gql`
  ${EXTRA_FIELDS}
  query getExtras {
    getExtras { ...ExtraFields }
  }
`

export const CREATE_EXTRA = gql`
  ${EXTRA_FIELDS}
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
    ) { ...ExtraFields }
  }
`

export const MODIFY_EXTRA = gql`
  ${EXTRA_FIELDS}
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
    ) { ...ExtraFields }
  }
`

export const DELETE_EXTRAS = gql`
  mutation deleteExtras(
    $ids: [ID]!
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
    $grades: [InputGrade]
    $remotePlatforms: [Int]
    $otherRemotePlatformOption: String
    $desc: String
    $inPersonVisit: Boolean
    $remoteVisit: Boolean
    $schoolVisit: Boolean
    $extras: [ID]
    $tags:[String]
    $start:String
    $end:String
    $customForm: ID
    $group: ID
    $publishDate: String
    $languages: [String]
    $limits: String
    $closedDays: Int
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
      schoolVisit: $schoolVisit
      extras: $extras
      tags: $tags
      start: $start
      end: $end
      customForm: $customForm
      group: $group
      publishDate: $publishDate
      languages: $languages
      limits: $limits
      closedDays: $closedDays
    ) { ...EventFields }
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
  mutation updateUser($user: ID!, $password: String, $username: String, $isAdmin: Boolean) {
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

export const EVENT_MODIFIED = gql`
  subscription {
    eventModified {
      id
    }
  }
`

export const EVENTS_MODIFIED = gql`
  subscription {
    eventsModified {
      id
    }
  }
`

export const EVENTS_DELETED = gql`
  subscription {
    eventsDeleted
  }
`

export const FORCE_DELETE_EVENTS = gql`
  mutation forceDeleteEvents($events: [ID]!, $password: String!) {
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
    $senderText: String!
  ) {
    updateEmail(
      name: $name
      subject: $subject
      html: $html
      text: $text
      ad: $ad
      adSubject: $adSubject
      adText: $senderText
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
      disabled
    }
  }
`

export const CREATE_GROUP = gql`
  mutation createGroup (
    $name: String!
    $maxCount: Int!
  ) {
    createGroup(
      name: $name
      maxCount: $maxCount
    ) {
      id
      name
      events {
        id
        title
      }
      maxCount
      visitCount
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
    $disabled: Boolean
  ) {
    modifyGroup(
      id: $id
      name: $name
      maxCount: $maxCount
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
      disabled
    }
  }
`

export const CANCEL_FORM = gql`
  query getCancelForm {
    getCancelForm {
      id
      name
      fields
    }
  }
`
