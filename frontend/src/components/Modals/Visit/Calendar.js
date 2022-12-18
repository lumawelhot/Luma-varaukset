import React, { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import fiLocale from '@fullcalendar/core/locales/fi'
import { default as LumaEvent } from '../../LumaCalendar/Event'
import { CALENDAR_SETTINGS } from '../../../config'
import { calendarEvents } from '../../../helpers/parse'
import { useUsers, useEvents, useMisc } from '../../../hooks/cache'
import styled from 'styled-components'
import { Button } from '../../Embeds/Button'
import PropTypes from 'prop-types'

const NavButton = styled(Button)`margin: 0; margin-left: -1px;`
const DateString = styled.span`
  font-size: 25px;
  font-weight: bold;
  @media (max-width: 500px) {
    display: none;
    visibility: hidden;
  }
`

const Calendar = ({ event, setEvent, slot }) => {
  const { current: user } = useUsers()
  const { parsed, findEvent } = useEvents()
  const { calendarOptions, setCalendarOptions } = useMisc()
  const calendarRef = useRef()
  const calApi = calendarRef?.current?.getApi()
  const title = calApi?.currentDataManager?.data?.viewTitle

  const handleView = (item) => setCalendarOptions({
    date: new Date((item.start.getTime() + item.end.getTime()) / 2),
    view: item.view.type
  })

  const handleClick = e => {
    const def = e.event._def
    const start = def.extendedProps.eventStart
    const id = def.publicId
    if (event?.id === id && new Date(start).getTime() === new Date(slot?.start).getTime()) setEvent()
    else setEvent({
      ...findEvent(id),
      slot: {
        start: def.extendedProps.eventStart,
        end: def.extendedProps.eventEnd,
      }
    })
  }

  // This is here because of bugs with prodcution build. Race conditions ??? Do not remove or create an alternative solution.
  calendarEvents(parsed, user)

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        locale={fiLocale}
        initialView={calendarOptions.view}
        initialDate={calendarOptions.date}
        events={calendarEvents(parsed, user)
          ?.filter(e => !e.unAvailable)
          ?.map(e => (
            e.id === event?.id &&
            new Date(e.start).getTime() === new Date(slot?.start).getTime()
          ) ? ({ ...e, color: 'grey' }) : e)
          ?.map(e => ({ ...e, editable: false }))}
        eventClick={handleClick}
        datesSet={handleView}
        editable={false}
        eventContent={e => <LumaEvent content={e} />}
        { ...CALENDAR_SETTINGS }
      />
      <div style={{ marginBottom: 30, justifyContent: 'space-between', display: 'flex' }}>
        <NavButton onClick={e => {
          e.preventDefault()
          calApi?.prev()
        }}>{'<'}</NavButton>
        <DateString>{title}</DateString>
        <NavButton onClick={e => {
          e.preventDefault()
          calApi?.next()
        }}>{'>'}</NavButton>
      </div>
    </>
  )
}

export default Calendar

Calendar.propTypes = {
  event: PropTypes.object,
  slot: PropTypes.object,
  setEvent: PropTypes.func.isRequired,
}
