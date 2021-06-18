import React from 'react'
import { resourceColors } from '../../helpers/styles'

const LumaEvent = ({ event }) => {
  return (
    <span style={{ backgroundColor:resourceColors[event.resourceids-1] }}>
      <strong style={{ color: 'white' }}>{event.title}</strong>
    </span>
  )
}

export default LumaEvent