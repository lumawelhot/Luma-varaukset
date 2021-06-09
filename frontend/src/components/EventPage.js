import React from 'react'
import { useParams } from 'react-router-dom'

const EventPage = ({ events }) => {
  const id = useParams().id
  const event = events.find(e => e.id === id)
  console.log(event)

  return (
    <div>
      <h1 className="title">{event.title}</h1>
      <ul>
        <li>alkaa: {event.start.toString()}</li>
        <li>päättyy: {event.end.toString()}</li>
        <li>luokat: {event.grades.toString()}</li>
      </ul>
    </div>
  )
}

export default EventPage