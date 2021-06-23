import React, { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/fi'
import { messages } from './helpers/calendar-messages-fi'
import { bookedEventColor, resourceColorsLUMA } from './helpers/styles'
import LumaWorkWeek from './components/Custom/LumaWorkWeek'
import CalendarFilter from './components/CalendarFilter'

const localizer = momentLocalizer(moment)

const resourceMap = [
  { resourceids: 1, resourceTitle: 'Summamutikka' },
  { resourceids: 2, resourceTitle: 'Fotoni' },
  { resourceids: 3, resourceTitle: 'Linkki' },
  { resourceids: 4, resourceTitle: 'Geopiste' },
  { resourceids: 5, resourceTitle: 'Gadolin' },
]

const MyCalendar = ({ events, currentUser, showNewEventForm, handleEventClick }) => {

  const [localEvents, setEvents] = useState([])
  const [filterFunction, setFilterFunction] = useState(() => () => { return true })

  useEffect(() => {
    setEvents(events)
  }, [events])

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
    /* const startsAfter14Days = moment(event.start).diff(new Date(), 'days') >= 14
    const startsAfter1Hour = moment(event.start).diff(new Date(), 'minutes') >= 60 */
    if (event.booked/*  || (!currentUser && !startsAfter14Days) || (currentUser && !startsAfter1Hour) */) {
      return { className: 'booked' , }
    }
    return { className: event.resourceids.length > 1 ? 'multiple' : resourceMap[event.resourceids[0]-1]?.resourceTitle.toLowerCase() || '' }
  }

  const AgendaEvent = ({ event }) => {
    const resourceName = resourceMap[event.resourceids[0]-1]?.resourceTitle || null
    console.log(event.booked)
    if (event.booked) {
      console.log(event.booked)
      return (
        <div className="block">
          {resourceName &&
            <span className='tag is-small is-link' style={{ backgroundColor: bookedEventColor[0] }}>{resourceName}</span>
          }
          <span> {event.title}</span>
          <p>{event.desc}</p>
        </div>
      )
    }
    return (
      <div className="block">
        {resourceName &&
          <span className='tag is-small is-link' style={{ backgroundColor: resourceColorsLUMA[event.resourceId - 1] }}>{resourceName}</span>
        }
        <span> {event.title}</span>
        <p>{event.desc}</p>
      </div>
    )
  }

  return (
    <div>
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
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
        events={localEvents.filter(event => filterFunction(event))}
        startAccessor='start'
        endAccessor='end'
        min={moment('8:00am', 'h:mma').toDate()}
        max={moment('5:00pm', 'h:mma').toDate()}
        //resources={resourceMap}
        //resourceidsAccessor="resourceids"
        //resourceTitleAccessor="resourceTitle"
        selectable={currentUser?.isAdmin}
        onSelectEvent={(event) => handleEventClick(event)/* alert(JSON.stringify(event)) */}
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