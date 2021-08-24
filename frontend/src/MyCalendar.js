import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { resourceColorsLUMA } from './helpers/styles'
import CalendarFilter from './components/Filter/CalendarFilter'
import { differenceInDays, differenceInMinutes }  from 'date-fns'
import { ModifyEvent } from './components/ModifyEventModal'
import { useTranslation } from 'react-i18next'
import { EventForm } from './components/EventForm'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const Wrapper = (props) => {
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

const MyCalendar = ({
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
  setShowFull
}) => {
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [actionSelection, setActionSelection] = useState(false)
  const [event, setEvent] = useState(null)
  const { t } = useTranslation('common')
  const [localEvents, setEvents] = useState([])
  const [filterFunction, setFilterFunction] = useState(() => () => { return true })
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  useEffect(() => {
    if (!currentUser) setEvents(events.filter(event => event.disabled === false))
    else setEvents(events)
  }, [events, currentUser])

  const handleClose = () => {
    setShowModifyModal(false)
    setShowCopyModal(false)
    setActionSelection(false)
    setEvent(null)
  }

  const handleView = (item) => {
    setCurrentDate(new Date((item.start.getTime() + item.end.getTime()) / 2))
    setCurrentView(item.view.type)
  }

  const handleDrop = (item) => {
    const details = item.event._def.extendedProps
    const delta = item.delta.milliseconds + 86400000 * item.delta.days
    const id = item.event._def.publicId
    const event = {
      ...details,
      id,
      eventStart: new Date(details.eventStart.getTime() + delta),
      eventEnd: new Date(details.eventEnd.getTime() + delta),
      duration: details.len
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

  return (
    <>
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
      <div className={`modal ${showCopyModal ? 'is-active':''}`}>
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
      <Wrapper elementId='filterdiv'>
        <CalendarFilter
          filterFunction={filterFunction}
          setFilterFunction={setFilterFunction}
          tags={tags}
        />
      </Wrapper>
      <Wrapper elementId="filterspan">
        {currentUser &&
          <button
            style={{ marginLeft: 10 }}
            className={`button luma ${showFull ? 'active' : ''}`}
            onClick={() => setShowFull(!showFull)}
          >{t('events-with-full-group')}</button>
        }
      </Wrapper>
      <div className="filterbox" style={{ display: showFilterOptions ? 'block' : 'none' }}>
        <div className="box">
          <div id="filterdiv"></div>
          <button className="button luma is-small" onClick={() => setShowFilterOptions(!showFilterOptions)}>OK</button>
          <span id="filterspan" ></span>
        </div>
      </div>
      <FullCalendar
        editable={currentUser ? true : false}
        plugins={[ timeGridPlugin, dayGridPlugin, interactionPlugin ]}
        initialView={currentView}
        height={600}
        headerToolbar={{
          left: 'today prev,next',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay filterButton'
        }}
        customButtons={{
          filterButton: {
            text: t('filter'),
            click: () => setShowFilterOptions(!showFilterOptions)
          }
        }}
        datesSet={handleView}
        weekends={false}
        initialDate={currentDate}
        selectable={true}
        dayMaxEvents={true}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        events={localEvents
          .map(event => {
            event.title = event.titleText
            const after14Days = differenceInDays(event.start, new Date()) >= 14
            const after1Hour = differenceInMinutes(event.start, new Date()) >= 60
            const booked = (!currentUser && !after14Days) || (currentUser && !after1Hour) || event.booked
            event.color = booked ? '#8a8a8a' : (event.resourceids.length > 1 ? 'black' : resourceColorsLUMA[event.resourceids[0] - 1])
            event.len = event.duration
            event.slotStart = event.start
            event.slotEnd = event.end
            return event
          })
          .filter(event => event.group ? (!event.group.disabled || showFull) : true)
          .filter(event => filterFunction(event))}
        eventDrop={handleDrop}
        eventClick={handleEventClick}
      />
    </>)
}

export default MyCalendar