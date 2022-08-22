import React from 'react'

export const EventContext = React.createContext()
export const MiscContext = React.createContext()

import EventProvider from './EventProvider'
import MiscProvider from './MiscProvider'

const LumaContext = ({ children }) => (
  <EventProvider>
    <MiscProvider>
      {children}
    </MiscProvider>
  </EventProvider>
)

export default LumaContext
