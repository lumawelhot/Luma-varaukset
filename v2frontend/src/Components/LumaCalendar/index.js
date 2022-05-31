/* eslint-disable no-unused-vars */
import React, { useState, useRef, useContext, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import { UserContext, EventContext, MiscContext } from '../../services/contexts'
import { useNavigate } from 'react-router-dom'
import Event from '../Modals/Event'
import { default as LumaEvent } from './Event'
import { CALENDAR_SETTINGS } from '../../config'
import CalendarMenu from './Menu'
import { calendarEvents } from '../../helpers/parse'
import { eventInit, eventInitWithValues } from '../../helpers/initialvalues'

const LumaCalendar = () => {
  const { current: user } = useContext(UserContext)
  const { set, parsed, find, current } = useContext(EventContext)
  const { calendarOptions, setCalendarOptions } = useContext(MiscContext)
  const [showEvent, setShowEvent] = useState()
  const [dragValues, setDragValues] = useState()
  const calendarRef = useRef()
  const navigate = useNavigate()

  const handleView = (item) => setCalendarOptions({
    date: new Date((item.start.getTime() + item.end.getTime()) / 2),
    view: item.view.type
  })

  const handleClose = () => {
    setShowEvent(false)
    setDragValues(undefined)
  }

  const handleDrop = (item) => {
    const found = find(item.event._def.publicId)
    const delta = item.delta.milliseconds + 86400000 * item.delta.days
    const event = {
      ...found,
      eventStart: new Date(new Date(found.start).getTime() + delta),
      eventEnd: new Date(new Date(found.end).getTime() + delta),
    }
    set(event)
    setShowEvent(true)
  }

  const handleDateSelect = info => {
    if (!user) return
    setDragValues({
      start: info.start,
      end: info.end
    })
    const calApi = calendarRef.current.getApi()
    calApi.unselect()
  }

  const handleDateClick = info => {
    setCalendarOptions({ ...calendarOptions, view: info.view.type })
    const calApi = calendarRef.current.getApi()
    calApi.changeView('timeGridDay', info.date)
  }

  return (
    <>
      <CalendarMenu ref={calendarRef} />
      <div id="eventPopover"></div>
      {showEvent && <Event
        show={showEvent}
        close={handleClose}
        options initialValues={eventInitWithValues(current)}
      />}
      {dragValues && <Event
        show={true}
        close={handleClose}
        initialValues={{
          ...eventInit, ...dragValues
        }} />}
      <FullCalendar
        ref={calendarRef}
        editable={user ? true : false}
        initialView={calendarOptions.view}
        initialDate={calendarOptions.date}
        selectable={user}
        events={calendarEvents(parsed, user)}
        eventClick={({ event }) => {
          const props = event._def.extendedProps
          if (!user && props.booked) return
          else if (set(event._def.publicId, {
            booked: props.booked, start: props.eventStart
          })) navigate('/visit')
        }}
        datesSet={handleView}
        eventDrop={handleDrop}
        select={handleDateSelect}
        dateClick={handleDateClick}
        eventContent={e => <LumaEvent content={e} />}
        { ...CALENDAR_SETTINGS }
      />
    </>
  )
}

export default LumaCalendar