import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fi'
import { messages } from './helpers/calendar-messages-fi'
import { /* bookedEventColor, */ resourceColorsLUMA } from './helpers/styles'
import LumaWorkWeek from './components/Custom/LumaWorkWeek'

const localizer = momentLocalizer(moment)

const resourceMap = [
  { resourceId: 1, resourceTitle: 'Summamutikka' },
  { resourceId: 2, resourceTitle: 'Fotoni' },
  { resourceId: 3, resourceTitle: 'Linkki' },
  { resourceId: 4, resourceTitle: 'Geopiste' },
  { resourceId: 5, resourceTitle: 'Gadolin' },
]

const MyCalendar = ({ events, currentUser, showNewEventForm, handleEventClick }) => {

  const [localEvents, setEvents] = useState([])

  useEffect(() => {
    setEvents(events)
  },[events])

  const handleSelect = ({ start, end }) => {
    showNewEventForm(start, end)
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
    if (event.booked || moment(event.start).diff(new Date(), 'days') < 14) {
      return { className: 'booked' , }
    }
    return { className: resourceMap[event.resourceId-1]?.resourceTitle.toLowerCase() || '' }
  }

  const AgendaEvent = ({ event }) => {
    const resourceName = resourceMap[event.resourceId-1]?.resourceTitle || null
    return (
      <div className="block">
        {resourceName &&
          <span className='tag is-small is-link' style={{ backgroundColor:resourceColorsLUMA[event.resourceId-1] }}>{resourceName}</span>
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