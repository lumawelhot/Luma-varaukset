/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { classes } from './helpers/classes'
import CalendarFilter from './components/Filter/CalendarFilter'
import { differenceInDays, differenceInMinutes }  from 'date-fns'
import { ModifyEvent } from './components/ModifyEventModal'
import { useTranslation } from 'react-i18next'
import { EventForm } from './components/EventForm'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import luxonPlugin from '@fullcalendar/luxon'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import fiLocale from '@fullcalendar/core/locales/fi'
import svLocale from '@fullcalendar/core/locales/sv'
import enLocale from '@fullcalendar/core/locales/en-gb'
import LumaEvent from './components/Custom/LumaEvent'
import { FaFilter } from 'react-icons/fa'

const Wrapper = (props) => {
  const domClassNodes = document.getElementsByClassName(props.elementClass)
  if (domClassNodes.length) {
    return ReactDOM.createPortal(
      props.children,
      domClassNodes[0].parentElement
    )
  }
  const domNode = document.getElementById(props.elementId)
  if (domNode) {
    return ReactDOM.createPortal(
      props.children,
      domNode
    )
  } else {
    return null
  }
}

const LumaCalendar = ({
  events,
  currentUser,
  handleEventClick,
  currentDate,
  setCurrentDate,
  currentView,
  setCurrentView,
  sendMessage,
  addEvent,
  tags,
  showFull,
  setShowFull,
  showNewEventForm
}) => {
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [actionSelection, setActionSelection] = useState(false)
  const [event, setEvent] = useState(null)
  const { t, i18n } = useTranslation('common')
  const [localEvents, setEvents] = useState([])
  const [filterFunction, setFilterFunction] = useState(() => () => { return true })
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const calendarRef = useRef()

  const resourceColors = classes.map(c => c.color)

  useEffect(() => {
    if (!currentUser) setEvents(events.filter(event => event.disabled === false))
    else setEvents(events)
  }, [events, currentUser])

  const handleView = (item) => {
    setCurrentDate(new Date((item.start.getTime() + item.end.getTime()) / 2))
    setCurrentView(item.view.type)
  }

  const handleClose = () => {
    setShowModifyModal(false)
    setShowCopyModal(false)
    setActionSelection(false)
    setEvent(null)
  }

  const handleDrop = (item) => {
    const details = item.event._def.extendedProps.details
    const delta = item.delta.milliseconds + 86400000 * item.delta.days
    const event = {
      ...details,
      eventStart: new Date(details.start.getTime() + delta),
      eventEnd: new Date(details.end.getTime() + delta),
    }
    setEvent(event)
    setActionSelection(true)
  }

  const handleCopy = () => {
    setActionSelection(false)
    setShowCopyModal(true)
  }

  const handleMove = () => {
    setActionSelection(false)
    setShowModifyModal(true)
  }

  const ActionSelection = () => {
    if (!event) return <></>
    return (
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{event.titleText}</p>
        </header>
        <footer className="modal-card-foot">
          <button className="button luma" type='submit' onClick={handleCopy}>{t('copy')}</button>
          {!event.hasVisits &&
            <button className="button luma" type='submit' onClick={handleMove}>{t('move')}</button>
          }
          <button className="button" onClick={handleClose}>{t('close')}</button>
        </footer>
      </div>
    )
  }

  const getLocale = () => {
    if (i18n.language.startsWith('fi')) {
      return fiLocale
    } else if (i18n.language.startsWith('sv')) {
      return svLocale
    }
    return enLocale
  }

  const handleDateSelect = (selectInfo) => {
    if (!currentUser) return
    showNewEventForm(selectInfo.start, selectInfo.end)
    const calApi = calendarRef.current.getApi()
    if (selectInfo.jsEvent.path[0].className.includes('number')) {
      calApi.changeView('timeGridDay', selectInfo.startStr)
      return
    }
    calApi.unselect()
  }

  const handleDateClick = (info) => {
    setCurrentDate(info.date)
    const calApi = calendarRef.current.getApi()
    calApi.changeView('timeGridDay', info.date)
  }

  return (
    <>
      <div id="eventPopover"></div>
      <div className={`modal ${actionSelection ? 'is-active':''}`}>
        <div className="modal-background"></div>
        <ActionSelection />
      </div>
      <div className={`modal ${showModifyModal ? 'is-active':''}`}>
        <div className="modal-background"></div>
        {event && <ModifyEvent
          event={event}
          setEvent={setEvent}
          close={handleClose}
          sendMessage={sendMessage}
          tags={tags}
        />}
      </div>
      <div className={`modal ${showCopyModal ? 'is-active': ''}`}>
        <div className="modal-background"></div>
        {event && <EventForm
          event={event}
          sendMessage={sendMessage}
          addEvent={event => {
            addEvent(event)
            setShowCopyModal(false)
            setEvent(null)
          }}
          closeEventForm={handleClose}
          tags={tags}
        />}
      </div>
      <div className="filterbox" style={{ display: showFilterOptions ? 'block' : 'none' }}>
        <div className="box">
          <CalendarFilter
            filterFunction={filterFunction}
            setFilterFunction={setFilterFunction}
            tags={tags}
          />
          <button className="button luma is-small" onClick={() => setShowFilterOptions(!showFilterOptions)}>OK</button>
          {currentUser &&
            <button
              style={{ marginLeft: 10 }}
              className={`button luma ${showFull ? 'active' : ''}`}
              onClick={() => setShowFull(!showFull)}
            >{t('events-with-full-group')}</button>
          }
        </div>
      </div>
      <Wrapper elementClass="fc-filterButton-button fc-button fc-button-primary">
        <button id="filterButton" type="button" className="button luma fc-button fc-button-primary" style={{ marginLeft: -10, paddingTop: 3 }} onClick={() => setShowFilterOptions(!showFilterOptions)}>
          <span className="icon is-small" style={{ position: 'relative', top: 2 }}><FaFilter/></span>
          <span>{t('filter')}</span>
          <span id="filterCount"></span>
        </button>
      </Wrapper>
      <FullCalendar
        ref={calendarRef}
        editable={currentUser ? true : false}
        plugins={[ timeGridPlugin, dayGridPlugin, interactionPlugin, listPlugin, luxonPlugin ]}
        initialView={currentView}
        locale={getLocale()}
        height={548}
        headerToolbar={{
          left: 'today prev,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth filterButton'
        }}
        customButtons={{
          filterButton: {
            text: t('filter'),
            click: () => setShowFilterOptions(!showFilterOptions)
          }
        }}
        buttonText={{
          list: 'Agenda'
        }}
        datesSet={(e) => handleView(e)}
        weekends={false}
        weekNumbers={true}
        nowIndicator={true}
        initialDate={currentDate}
        selectable={currentUser}
        dayMaxEvents={true}
        businessHours={{
          daysOfWeek : [1, 2, 3, 4, 5],
          startTime: '8:00',
          endTime: '17:00'
        }}
        slotMinTime="08:00:00"
        slotMaxTime="17:01:00"
        snapDuration='00:30:00'
        events={localEvents
          .map(event => {
            const after14Days = differenceInDays(event.start, new Date()) >= 14
            const after1Hour = differenceInMinutes(event.start, new Date()) >= 60
            const booked = (!currentUser && !after14Days) || (currentUser && !after1Hour) || event.booked
            event.color = (booked || event.disabled) ? '#8a8a8a' : (event.resourceids.length > 1 ? 'black' : resourceColors[event.resourceids[0] - 1])
            const details = {
              ...event
            }
            return {
              details,
              id: event.id,
              color: event.color,
              start: event.start,
              end: event.end,
              title: event.titleText,
              constraint: 'businessHours'
            }
          })
          .filter(event => event.details.group ? (!event.details.group.disabled || showFull) : true)
          .filter(event => filterFunction(event.details))}
        eventDrop={handleDrop}
        eventClick={handleEventClick}
        eventColor='#8a8a8a'
        selectConstraint='businessHours'
        eventContent={(eventInfo) => <LumaEvent eventInfo={eventInfo} currentUser={currentUser} />}
        select={(e) => handleDateSelect(e)}
        dateClick={(e) => handleDateClick(e)}
        selectMirror={true}
        allDaySlot={false}
        timeZone='Europe/Helsinki'
      />
    </>)
}

export default LumaCalendar