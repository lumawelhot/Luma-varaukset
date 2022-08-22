// This file contains the interface to interact with the cache and the API.
// All communication between frontend and backend should happen in "context" directory.
// All cache manipulation happens also there.

import { useContext } from 'react'
import {
  EventContext,
  MiscContext,
} from '../context'
import { useUsers, useVisits } from './cache'

export const useEvict = () => {
  const events = useContext(EventContext)
  const users = useUsers()
  const visits = useVisits()

  const evict = () => {
    visits.evict()
    events.evict()
    users.evict()
  }

  return { evict }
}

export const useEvents = () => useContext(EventContext)

export const useMisc = () => useContext(MiscContext)
