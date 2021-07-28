import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { bookedEventColor, resourceColorsLUMA } from './helpers/styles'
import LumaWorkWeek from './components/Custom/LumaWorkWeek'
import LumaToolbar from './components/Custom/LumaToolbar'
import LumaEvent from './components/Custom/LumaEvent'
import CalendarFilter from './components/Filter/CalendarFilter'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import set from 'date-fns/set'
import { fi } from 'date-fns/locale'
import { differenceInDays, differenceInMinutes }  from 'date-fns'
import { Tooltip } from 'antd'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { ModifyEvent } from './components/ModifyEventModal'
import { useTranslation } from 'react-i18next'
import { EventForm } from './components/EventForm'

const DragAndDropCalendar = withDragAndDrop(Calendar)

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { fi },
})

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
  showNewEventForm,
  handleEventClick,
  currentDate,
  setCurrentDate,
  currentView,
  setCurrentView,
  sendMessage,
  addEvent,
  tags
}) => {
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [actionSelection, setActionSelection] = useState(false)
  const [event, setEvent] = useState(null)
  const { t } = useTranslation('common')
  const [localEvents, setEvents] = useState([])
  const [filterFunction, setFilterFunction] = useState(() => () => { return true })
  const resourceMap = [
    { resourceids: 1, resourceTitle: 'Summamutikka', description: t('mathematics') },
    { resourceids: 2, resourceTitle: 'Fotoni', description: t('physics') },
    { resourceids: 3, resourceTitle: 'Linkki', description: t('computer-science') },
    { resourceids: 4, resourceTitle: 'Geopiste', description: t('geography') },
    { resourceids: 5, resourceTitle: 'Gadolin', description: t('chemistry') },
  ]

  const messages = {
    allDay: 'Koko päivä',
    previous: '<',
    next: '>',
    today: t('today'),
    month: t('month'),
    week: t('week'),
    day: t('day'),
    agenda: 'Agenda',
    date: t('date'),
    time: t('time'),
    event: t('event'),
    noEventsInRange: t('no-events-in-range'),
    showMore: (total) => `+ Näytä lisää (${total})`,
    work_week: t('week'),
    yesterday: t('yesterday'),
    tomorrow: t('tomorrow'),
  }

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

  const handleNavigate = (date) => {
    if (date) setCurrentDate(date)
  }

  const handleView = (view) => {
    if (view) setCurrentView(view)
  }

  const handleSelect = ({ start, end }) => {
    showNewEventForm(start, end)
  }

  const handleDrop = (item) => {
    const event = {
      ...item.event,
      eventStart: item.start,
      eventEnd: item.end
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
    const disabled = event.disabled
    if (booked) {
      return { className: 'booked' , }
    }
    if (disabled) {
      return { className: 'disabled' }
    }
    return { className: event.resourceids.length > 1 ? 'multiple' : resourceMap[event.resourceids[0]-1]?.resourceTitle.toLowerCase() || '' }
  }

  const AgendaEvent = ({ event }) => {

    const resourceNames = event.resourceids.map(id => { return { name: resourceMap[id-1]?.resourceTitle || null, color: resourceColorsLUMA[id - 1], description: resourceMap[id-1]?.description }})
    if(event.disabled) {
      return (
        <>
          <div className="media luma-agenda" style={{ paddingLeft: 117 }} onClick={() => handleEventClick(event)}>
            <div className="media-content">
              <strong style={{ color: 'red' }}>{event.title} - {t('disabled')}!</strong>
            </div>
          </div>
        </>
      )
    }


    return (
      <div className="media luma-agenda" onClick={() => handleEventClick(event)}>
        {!!resourceNames.length && <div className="media-left" style={{ width: 100 }}><div className="tags">
          {resourceNames.map(r =>
            <Tooltip key={r.name} color={'geekblue'} title={r.description} placement={'right'}>
              <span className='tag is-small is-link' style={{
                backgroundColor: event.booked ? bookedEventColor : r.color }}
              >{r.name}</span>
            </Tooltip>)}
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

  const ActionSelection = () => {
    if (!event) return <></>
    return (
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{event.title}</p>
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
        <CalendarFilter filterFunction={filterFunction} setFilterFunction={setFilterFunction} />
      </Wrapper>
      <DragAndDropCalendar
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
        selectable={!!currentUser}
        onSelectEvent={(event) => handleEventClick(event)}
        onSelectSlot={handleSelect}
        components={{
          event: LumaEvent,
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
        tooltipAccessor={null}
        draggableAccessor={() => currentUser ? true : false}
        onEventDrop={handleDrop}
      />
    </>)
}

export default MyCalendar