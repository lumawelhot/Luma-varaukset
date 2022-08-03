// This file contains the interface to interact with the cache and the API.
// All communication between frontend and backend should happen in "context" directory.
// All cache manipulation happens also there.

import { useContext } from 'react'
import {
  EventContext,
  UserContext,
  VisitContext,
  GroupContext,
  MiscContext,
  FormContext
} from '../context'

export const useEvict = () => {
  const user = useContext(UserContext)
  const visits = useContext(VisitContext)
  const events = useContext(EventContext)

  const evict = () => {
    user.evict()
    visits.evict()
    events.evict()
  }

  return { evict }
}

export const useEvents = () => {
  return useContext(EventContext)
}

export const useVisits = () => {
  return useContext(VisitContext)
}

export const useGroups = () => {
  return useContext(GroupContext)
}

export const useForms = () => {
  return useContext(FormContext)
}

export const useUser = () => {
  return useContext(UserContext)
}

export const useMisc = () => {
  return useContext(MiscContext)
}