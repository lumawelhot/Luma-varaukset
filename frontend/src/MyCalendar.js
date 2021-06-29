import React, { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { messages } from './helpers/calendar-messages-fi'
import { bookedEventColor, resourceColorsLUMA } from './helpers/styles'
import LumaWorkWeek from './components/Custom/LumaWorkWeek'
import LumaToolbar from './components/Custom/LumaToolbar'
import CalendarFilter from './components/CalendarFilter'

import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import set from 'date-fns/set'
import { fi } from 'date-fns/locale'
import { differenceInDays, differenceInMinutes }  from 'date-fns'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { fi },
})

const resourceMap = [
  { resourceids: 1, resourceTitle: 'Summamutikka' },
  { resourceids: 2, resourceTitle: 'Fotoni' },
  { resourceids: 3, resourceTitle: 'Linkki' },
  { resourceids: 4, resourceTitle: 'Geopiste' },
  { resourceids: 5, resourceTitle: 'Gadolin' },
]

const MyCalendar = ({ events, currentUser, showNewEventForm, handleEventClick, currentDate, setCurrentDate, currentView, setCurrentView }) => {

  const [localEvents, setEvents] = useState([])
  const [filterFunction, setFilterFunction] = useState(() => () => { return true })

  useEffect(() => {
    setEvents(events)
  }, [events])

  const handleNavigate = (date) => {
    if (date) setCurrentDate(date)
  }

  const handleView = (view) => {
    if (view) setCurrentView(view)
  }

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
    const startsAfter14Days = differenceInDays(event.start, new Date()) >= 14
    const startsAfter1Hour = differenceInMinutes(event.start, new Date()) >= 60
    const booked = (!currentUser && !startsAfter14Days) || (currentUser && !startsAfter1Hour) || event.booked
    if (booked) {
      return { className: 'booked' , }
    }
    return { className: event.resourceids.length > 1 ? 'multiple' : resourceMap[event.resourceids[0]-1]?.resourceTitle.toLowerCase() || '' }
  }

  const AgendaEvent = ({ event }) => {
    const resourceNames = event.resourceids.map(id => { return { name: resourceMap[id-1]?.resourceTitle || null, color: resourceColorsLUMA[id - 1] }})
    if (event.booked) {
      return (
        <div className="media luma-agenda" onClick={() => handleEventClick(event)}>
          {!!resourceNames.length && <div className="media-left" style={{ width: 100 }}><div className="tags">
            {resourceNames.map(r =>
              <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: bookedEventColor }}>{r.name}</span>)}
          </div></div>}
          <div className="media-content">
            <strong>{event.title}</strong>
            <p>{event.desc}</p>
          </div>
        </div>
      )
    }
    return (
      <div className="media luma-agenda" onClick={() => handleEventClick(event)}>
        {!!resourceNames.length && <div className="media-left" style={{ width: 100 }}><div className="tags">
          {resourceNames.map(r =>
            <span key={r.name} className='tag is-small is-link' style={{ backgroundColor: r.color }}>{r.name}</span>)}
        </div></div>}
        <div className="media-content">
          <strong>{event.title}</strong>
          <p>{event.desc}</p>
        </div>
      </div>
    )
  }

  let formats = {
    monthHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'LLLL yyyy', culture),
    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, 'cccc, d. MMMM yyyy', culture),
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, 'cccccc d.M.', culture)
  }


  return (
    <div>
      <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
      <Calendar
        culture='fi'
        localizer={localizer}
        formats={formats}
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
        min={set(new Date(), { hours: 8, minutes: 0, seconds:0, milliseconds: 0 })}
        max={set(new Date(), { hours: 17, minutes: 0, seconds:0, milliseconds: 0 })}
        selectable={currentUser?.isAdmin}
        onSelectEvent={(event) => handleEventClick(event)}
        onSelectSlot={handleSelect}
        components={{
          toolbar: LumaToolbar,
          agenda: {
            event: AgendaEvent
          }
        }}
        dayPropGetter={customDayPropGetter}
        eventPropGetter={customEventPropGetter}
        onNavigate={handleNavigate}
        onView={handleView}
        date={currentDate}
        view={currentView}
      />
    </div>)
}

export default MyCalendar