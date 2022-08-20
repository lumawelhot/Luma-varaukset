import React from 'react'

export const UserContext = React.createContext()
export const EventContext = React.createContext()
export const GroupContext = React.createContext()
export const VisitContext = React.createContext()
export const MiscContext = React.createContext()
export const FormContext = React.createContext()

import EventProvider from './EventProvider'
import FormProvider from './FormProvider'
import GroupProvider from './GroupProvider'
import MiscProvider from './MiscProvider'
import UserProvider from './UserProvider'
import VisitProvider from './VisitProvider'

const LumaContext = ({ children }) => (
  <UserProvider>
    <EventProvider>
      <GroupProvider>
        <VisitProvider>
          <FormProvider>
            <MiscProvider>
              {children}
            </MiscProvider>
          </FormProvider>
        </VisitProvider>
      </GroupProvider>
    </EventProvider>
  </UserProvider>
)

export default LumaContext
