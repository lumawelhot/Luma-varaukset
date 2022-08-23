import { useContext } from 'react'
import { LumaContext } from '../Cache'

// These hooks manipulates Cache and API calls
export const useUsers = () => useContext(LumaContext).service.users
export const useGroups = () => useContext(LumaContext).service.groups
export const useForms = () => useContext(LumaContext).service.forms
export const useExtras = () => useContext(LumaContext).service.extras
export const useVisits = () => useContext(LumaContext).service.visits
export const useEvents = () => useContext(LumaContext).service.events
export const useMisc = () => useContext(LumaContext).service.misc

export const useEvict = () => {
  const events = useEvents()
  const users = useUsers()
  const visits = useVisits()

  const evict = () => {
    visits.evict()
    events.evict()
    users.evict()
  }
  return { evict }
}
