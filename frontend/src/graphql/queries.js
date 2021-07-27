import { gql } from '@apollo/client'

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
      isAdmin
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
  query getEvents {
    getEvents {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
      waitingTime
      tags {
        id
        name
      }
      start
      end
      desc
      inPersonVisit
      remoteVisit
      availableTimes {
        startTime
        endTime
      }
      visits {
        startTime
        endTime
      }
      extras {
        id
        name
        inPersonLength
        remoteLength
      }
      duration
      customForm
      disabled
      locked
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
  query getVisits {
    getVisits {
      id
      event {
        id
        title
        resourceids
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      grade
      participants
      extras {
        id
        name
      }
      status
      startTime
      endTime
      remotePlatform
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

export const CREATE_EVENT = gql`
  mutation createEvent(
    $title: String!,
    $start: String!,
    $end: String!,
    $scienceClass: [Int]!,
    $grades: [Int]!,
    $remotePlatforms: [Int],
    $otherRemotePlatformOption: String,
    $remoteVisit: Boolean!,
    $inPersonVisit: Boolean!,
    $desc: String,
    $tags: [TagInput],
    $waitingTime: Int!
    $extras: [ID]
    $duration: Int!,
    $customForm: ID
    ) {
    createEvent (
      title: $title,
      start: $start,
      end: $end,
      scienceClass: $scienceClass,
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
    ) {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
      start
      end
      tags {
        name,
        id
      }
      visits {
        startTime,
        endTime
      }
      inPersonVisit
      remoteVisit
      desc
      availableTimes {
        startTime,
        endTime
      }
      extras {
        name,
        inPersonLength,
        remoteLength,
        id
      }
      duration
      customForm
      disabled
      waitingTime
      locked
    }
  }
`

export const CREATE_VISIT = gql`
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
    ) {
      id
      event {
        id
        title
      }
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      startTime
      endTime
      grade
      participants
      remotePlatform
      status
    }
  }
`
export const FIND_VISIT = gql`
  query findVisit($id: ID!) {
    findVisit(id: $id) {
      clientName
      schoolName
      schoolLocation
      clientEmail
      clientPhone
      event {
        title
        start
        end
        resourceids
        desc
      }
      extras {
        id
        name
      }
      grade
      startTime
      endTime
      participants
      inPersonVisit
      remoteVisit
      status
      remotePlatform
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

export const DELETE_EXTRA = gql`
  mutation deleteExtra(
    $id: String!
  ) {
    deleteExtra(
      id: $id
    )
  }
`

export const DELETE_EVENT = gql`
  mutation deleteEvent(
    $id: String!
  ) {
    deleteEvent(
      id: $id
    )
  }
`

export const DELETE_USER = gql`
  mutation deleteUser(
    $id: String!
  ) {
    deleteUser(
      id: $id
    )
  }
`

export const UPDATE_EVENT = gql`
  mutation modifyEvent(
    $event: ID!
    $title: String
    $scienceClass: [Int]
    $grades: [Int]
    $remotePlatforms: [Int]
    $otherRemotePlatformOption: String
    $desc: String
    $inPersonVisit: Boolean
    $remoteVisit: Boolean
    $extras: [ID]
    $tags:[TagInput]
    $start:String
    $end:String
    $customForm: ID
  ) {
    modifyEvent(
      event: $event
      title: $title
      resourceids: $scienceClass
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
    ) {
      id
      title
      resourceids
      grades
      remotePlatforms
      otherRemotePlatformOption
      inPersonVisit
      remoteVisit
      desc
      start
      end
      availableTimes {
        startTime,
        endTime
      }
      extras {
        name,
        inPersonLength,
        remoteLength,
        id
      }
      tags {
        name,
        id
      }
      customForm
      disabled
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
      title
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
      title
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

export const GET_FORM = gql`
  query getForm($id: ID!) {
    getForm(id: $id) {
      id
      name
      fields
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

export const UPDATE_FORM = gql`
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

export const DELETE_FORM = gql`
  mutation deleteForm($id: ID!) {
    deleteForm(
      id: $id
    )
  }
`

export const CREATE_FORM_SUBMISSION = gql`
  mutation createFormSubmission($formID: ID!, $values: String) {
    createFormSubmission(
      formID: $formID
      values: $values
    ) {
      id
      form {
        id
      }
      values
    }
  }
`

export const GET_FORM_SUBMISSIONS = gql`
  query getFormSubmissions($formID: ID!) {
    getFormSubmissions(
      formID: $formID
    ) {
      id
      values
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