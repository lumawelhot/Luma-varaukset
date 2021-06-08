import React from 'react'

const EventsList = ({ events }) =>
  <div>
    <h1 className="title">Events</h1>
    <table className="table">
      <thead>
        <tr>
          <th>Tapahtuma</th>
          <th>Alkaa</th>
          <th>Päättyy</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) =>
          <tr key={event.id}>
            <td><a href={`/events/${event.id}`}>{event.title}</a></td>
            <td>{event.start.toString()}</td>
            <td>{event.end.toString()}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

export default EventsList