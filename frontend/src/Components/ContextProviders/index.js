import React from 'react'
import EventProvider from './EventProvider'
import FormProvider from './FormProvider'
import GroupProvider from './GroupProvider'
import MiscProvider from './MiscProvider'
import UserProvider from './UserProvider'
import VisitProvider from './VisitProvider'

const ContextProviders = ({ children }) => {

  return (
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
}

export default ContextProviders
