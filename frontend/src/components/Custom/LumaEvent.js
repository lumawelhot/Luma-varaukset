import React from 'react'

const LumaEvent = ({ event }) => {
  console.log(event)
  return (
    <>
      <span>{event.title}</span>
      {event.availableTimes.map((timeSlot,index) => (
        <div key={index} style={{ backgroundColor:'red', width:200, height: 20, position: 'relative' }}>Varaa</div>
      )
      )}
    </>
  )
}

export default LumaEvent