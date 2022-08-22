import React from 'react'
import {
  useEventService,
  useExtraService,
  useFormService,
  useGroupService,
  useUserService,
  useVisitService
} from './hooks/service'

export const LumaContext = React.createContext()

const Cache = ({ children }) => {
  const service = {
    users: useUserService(),
    groups: useGroupService(),
    forms: useFormService(),
    extras: useExtraService(),
    visits: useVisitService(),
    events: useEventService(),
  }

  return (
    <LumaContext.Provider value={{ service }}>
      {children}
    </LumaContext.Provider>
  )
}

export default Cache
