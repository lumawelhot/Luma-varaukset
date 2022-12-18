import React, { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import fiLocale from '@fullcalendar/core/locales/fi'
import { default as LumaEvent } from '../../LumaCalendar/Event'
import { CALENDAR_SETTINGS, FIRST_EVENT_AFTER_DAYS } from '../../../config'
import { calendarEvents } from '../../../helpers/parse'
import { useUsers, useEvents } from '../../../hooks/cache'
import styled from 'styled-components'
import { Button } from '../../Embeds/Button'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { addDays, set } from 'date-fns'
import { DatePicker } from '../../Embeds/Input'

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
  const [calendarOptions, setCalendarOptions] = useState({
    view: 'timeGridWeek',
    date: addDays(set(new Date(), { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }), FIRST_EVENT_AFTER_DAYS),
  })
  const year = calendarOptions?.date?.getFullYear()
  const calendarRef = useRef()
  const calApi = calendarRef?.current?.getApi()
  const title = calApi?.currentDataManager?.data?.viewTitle
  const { t } = useTranslation()

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
      {event?.group?.disabled && <div style={{ color: 'red', fontSize: 20 }}>
        {t('group-is-disabled')}
      </div>}
      <DateString>{title}, {year}</DateString>
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
      <div style={{ marginBottom: 30, justifyContent: 'flex-start', display: 'flex' }}>
        <NavButton style={{ marginTop: 10, marginRight: 10 }} onClick={e => {
          e.preventDefault()
          calApi?.prev()
        }}>{'<'}</NavButton>
        <NavButton style={{ marginTop: 10, marginRight: 10 }} onClick={e => {
          e.preventDefault()
          calApi?.next()
        }}>{'>'}</NavButton>
        <DatePicker
          value={calendarOptions?.date}
          onChange={v => {
            const date = new Date(v)
            calApi?.changeView('timeGridWeek', date)
            setCalendarOptions({
              view: 'timeGridWeek',
              date: addDays(set(date, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }), FIRST_EVENT_AFTER_DAYS),
            })
          }}
        />
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
