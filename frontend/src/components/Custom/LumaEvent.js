import React from 'react'

const LumaEvent = ({ event }) => {
  return (
    <span style={{ backgroundColor:resourceColours[event.resourceId-1] }}>
      <strong style={{ color: 'white' }}>{event.title}</strong>
    </span>
  )
}

export default LumaEvent