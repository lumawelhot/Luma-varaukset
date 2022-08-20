import React, { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import fiLocale from '@fullcalendar/core/locales/fi'
import svLocale from '@fullcalendar/core/locales/sv'
import enLocale from '@fullcalendar/core/locales/en-gb'
import { useNavigate } from 'react-router-dom'
import Event from '../Modals/Event'
import { default as LumaEvent } from './Event'
import { CALENDAR_SETTINGS } from '../../config'
import CalendarMenu from './Menu'
import { calendarEvents } from '../../helpers/parse'
import { eventInit, eventInitWithValues } from '../../helpers/initialvalues'
import { Button } from '../Embeds/Button'
import { useTranslation } from 'react-i18next'
import { default as EventSelectAction } from '../Modals/EventListForms'
import { someExist } from '../../helpers/utils'
import Title from '../Embeds/Title'
import { useEvents, useMisc, useUser } from '../../hooks/api'

const LumaCalendar = () => {
  const { current: user } = useUser()
  const {
    all: events,
    set,
    parsed,
    find,
    current,
    filterOptions,
    select, selected,
    removeSelected,
    unSelectAll
  } = useEvents()
  const { calendarOptions, setCalendarOptions } = useMisc()
  const [showEvent, setShowEvent] = useState()
  const [dragValues, setDragValues] = useState()
  const [actionType, setActionType] = useState()
  const calendarRef = useRef()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const getLocale = () => lang.startsWith('fi')
    ? fiLocale : lang.startsWith('sv')
      ? svLocale : enLocale

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
    const delta = item.delta.milliseconds + (86400000 * item.delta.days)
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

  // This is here because of bugs with prodcution build. Race conditions ??? Do not remove or create an alternative solution.
  calendarEvents(parsed, user)?.filter(e => !e.unAvailable || filterOptions.showUnavailable)

  return (
    <>
      <EventSelectAction
        show={actionType ? true : false}
        close={() => setActionType()}
        selected={events.filter(e => someExist([e.id], selected))}
        type={actionType}
        reset={unSelectAll}
      />
      <CalendarMenu ref={calendarRef} />
      <div id='eventPopover'></div>
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
        locale={getLocale()}
        editable={user ? true : false}
        initialView={calendarOptions.view}
        initialDate={calendarOptions.date}
        selectable={user}
        events={calendarEvents(parsed, user)?.filter(e => !e.unAvailable || filterOptions.showUnavailable)}
        eventClick={({ event, jsEvent }) => {
          if (user && jsEvent.ctrlKey) {
            select(event._def.publicId)
            return
          }
          const props = event._def.extendedProps
          if (set(event._def.publicId, {
            booked: props.booked, start: props.eventStart, unAvailable: props.unAvailable
          })) navigate('/visit')
        }}
        datesSet={handleView}
        eventDrop={handleDrop}
        select={handleDateSelect}
        dateClick={handleDateClick}
        eventContent={e => <LumaEvent content={e} />}
        { ...CALENDAR_SETTINGS }
      />
      <div style={{ marginLeft: -10, marginTop: 10, lineHeight: 3, marginBottom: 10 }}>
        {!selected.length && user && <Title style={{ paddingLeft: 10 }}>{t('ctrl-tip')}</Title>}
        {!!selected.length && <Button onClick={() => setActionType('publish')}>{t('set-publishdate')}</Button>}
        {!!selected.length && <Button onClick={() => setActionType('group')}>{t('add-events-to-group')}</Button>}
        {!!selected.length && <Button onClick={() => {
          if (confirm(t('delete-events-confirm'))) removeSelected()
        }}>{t('remove-selected-events')}</Button>}
        {!!selected.length && <Button className='active' onClick={() => unSelectAll()}>{t('unselect-events')}</Button>}
      </div>
    </>
  )
}

export default LumaCalendar
