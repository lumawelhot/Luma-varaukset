import { useContext } from 'react'
import { LumaContext } from '../Cache'

export const useUsers = () => useContext(LumaContext).service.users
export const useGroups = () => useContext(LumaContext).service.groups
export const useForms = () => useContext(LumaContext).service.forms
export const useExtras = () => useContext(LumaContext).service.extras
export const useVisits = () => useContext(LumaContext).service.visits
export const useEvents = () => useContext(LumaContext).service.events
