import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fi'
import { messages } from './helpers/calendar-messages-fi'
import { resourceColors } from './helpers/styles'
import LumaWorkWeek from './components/Custom/LumaWorkWeek'
import { useHistory } from 'react-router-dom'
//import LumaEventWrapper from './components/Custom/LumaEventWrapper'

const localizer = momentLocalizer(moment)

const resourceMap = [
  { resourceId: 1, resourceTitle: 'Summamutikka' },
  { resourceId: 2, resourceTitle: 'Fotoni' },
  { resourceId: 3, resourceTitle: 'Linkki' },
  { resourceId: 4, resourceTitle: 'Geopiste' },
  { resourceId: 5, resourceTitle: 'Gadolin' },
]

const MyCalendar = ({ events, currentUser }) => {

  const [localEvents, setEvents] = useState([])
  const history = useHistory()

  useEffect(() => {
    setEvents(events)
  },[events])

  const handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name')
    if (title)
      setEvents([
        ...localEvents,
        {
          start,
          end,
          title,
          resourceId:1
        }]
      )
  }

  const handleEventClick = (event) => {
    console.log(event.id)
    history.push(`/event/${event.id}/book`)
  }

  const customDayPropGetter = date => {
    if (date.getDay() === 0 || date.getDay() === 6)
      return {
        className: 'weekend',
        style: {
          backgroundColor: '#e6e6e6'
        },
      }
    else return {}
  }

  const customEventPropGetter = event => {
    return { className: resourceMap[event.resourceId-1]?.resourceTitle.toLowerCase() || '' }
  }

  const AgendaEvent = ({ event }) => {
    const resourceName = resourceMap[event.resourceId-1]?.resourceTitle || null
    return (
      <div className="block">
        {resourceName &&
          <span className='tag is-small is-link' style={{ backgroundColor:resourceColors[event.resourceId-1] }}>{resourceName}</span>
        }
        <span> {event.title}</span>
        <p>{event.desc}</p>
      </div>
    )
  }

  return (
    <div>
      <Calendar
        culture='fi'
        localizer={localizer}
        messages={messages}
        views={{
          month: true,
          work_week: LumaWorkWeek,
          day: true,
          agenda: true
        }}
        showMultiDayTimes
        events={localEvents}
        startAccessor='start'
        endAccessor='end'
        min={moment('8:00am', 'h:mma').toDate()}
        max={moment('5:00pm', 'h:mma').toDate()}
        //resources={resourceMap}
        //resourceIdAccessor="resourceId"
        //resourceTitleAccessor="resourceTitle"
        selectable={currentUser?.isAdmin}
        onSelectEvent={ (event) => handleEventClick(event)/* alert(JSON.stringify(event)) */}
        onSelectSlot={handleSelect}
        components={{
          //eventWrapper: LumaEventWrapper,
          agenda: {
            event: AgendaEvent
          }
        }}
        dayPropGetter={customDayPropGetter}
        eventPropGetter={customEventPropGetter}
      />
    </div>)
}

export default MyCalendar