import { useContext } from 'react'
import { LumaContext } from '../Cache'

// These hooks manipulates Cache and API calls
// All the Cache manipulation and API request should happen behind these hooks
export const useUsers = () => useContext(LumaContext).services.users
export const useGroups = () => useContext(LumaContext).services.groups
export const useForms = () => useContext(LumaContext).services.forms
export const useExtras = () => useContext(LumaContext).services.extras
export const useVisits = () => useContext(LumaContext).services.visits
export const useEvents = () => useContext(LumaContext).services.events
export const useMisc = () => useContext(LumaContext).services.misc

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
