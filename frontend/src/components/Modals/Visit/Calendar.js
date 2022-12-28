import React, { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import fiLocale from '@fullcalendar/core/locales/fi'
import { default as LumaEvent } from '../../LumaCalendar/Event'
import { CALENDAR_SETTINGS, FIRST_EVENT_AFTER_DAYS } from '../../../config'
import { calendarEvents } from '../../../helpers/parse'
import { useUsers, useEvents } from '../../../hooks/cache'
import styled from 'styled-components'
import { Button, Checkbox } from '../../Embeds/Button'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { addDays, set } from 'date-fns'
import { DatePicker } from '../../Embeds/Input'

const NavButton = styled(Button)`margin: 0; margin-left: -1px;`

const Calendar = ({ event, visit, setEvent, slot }) => {
  const { current: user } = useUsers()
  const { parsed, findEvent } = useEvents()
  const [calendarOptions, setCalendarOptions] = useState({
    view: 'timeGridWeek',
    date: addDays(set(event
      ? new Date(event.start) : visit ? new Date(visit.startTime) : new Date()
    , { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 }), (event || visit) ? 0 : FIRST_EVENT_AFTER_DAYS),
  })
  const [combined, setCombined] = useState(false)
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
  const currentEvent = findEvent(visit?.event?.id || event?.event)

  // these are used for merging the current event with other available times if possible
  const current = parsed
    ?.filter(e => e?.id === visit?.event?.id)
    ?.sort((a, b) => new Date(a.start) - new Date(b.start))

  const mergeable = current
    ?.find(e => new Date(e.start).getTime() === new Date(visit?.startTime).getTime())

  const index = current
    ?.map((e, index) => ({ id: e.id, index, start: e?.start }))
    ?.find(e => new Date(e?.start).getTime() === new Date(mergeable?.start).getTime())
    ?.index

  const merged = current
    ?.map(e => {
      if (e.booked) {
        const start = index <= 0 ? mergeable?.start
          : current[index - 1]?.booked ? mergeable?.start : current[index - 1]?.start
        const end = index >= current.length - 1 ? mergeable?.end
          : current[index + 1]?.booked ? mergeable?.end : current[index + 1]?.end
        return { ...e, start, end }
      } else return e
    })
    ?.filter((_, i) => i === index)
  // ---------------------------------

  return (
    <>
      {currentEvent && <div style={{ fontWeight: 'bold', fontSize: 20 }}>
        <div>{t('current-event')}:
          <span style={{ color: 'red', fontWeight: 'normal' }}> {currentEvent.title}</span>
        </div>
        {currentEvent.group && <div>{t('belongs-to-group')}:
          <span style={{ color: 'red', fontWeight: 'normal' }}> {currentEvent?.group.name}</span>
        </div>}
      </div>}
      <hr style={{ marginTop: 5, marginBottom: 5 }}></hr>
      {event?.group?.disabled && <div style={{ color: 'red', fontSize: 20 }}>
        {t('group-is-disabled')}
      </div>}
      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{title}, {year}</div>
      <FullCalendar
        ref={calendarRef}
        locale={fiLocale}
        initialView={calendarOptions.view}
        initialDate={calendarOptions.date}
        events={calendarEvents(combined ? parsed
          ?.filter(e => !merged?.map(f => f.id)?.includes(e.id))
          .concat(merged) : parsed , user)
          ?.filter(e => (!e.unAvailable || (e?.id === visit?.event?.id && (
            new Date(e?.start).getTime() <= new Date(visit?.startTime).getTime() &&
            new Date(e?.end).getTime() >= new Date(visit?.endTime).getTime()
          ))))
          ?.map(e => (
            e.id === event?.id &&
            new Date(e.start).getTime() === new Date(slot?.start).getTime()
          ) ? ({ ...e, color: '#568082' }) : e)
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
        <div style={{ marginLeft: 10, marginTop: 15 }}>
          <Checkbox onChange={e => setCombined(e.target.checked)}>
            <span style={{ fontSize: 18 }}>{t('combine-timeslot')}</span>
          </Checkbox>
        </div>
      </div>
    </>
  )
}

export default Calendar

Calendar.propTypes = {
  event: PropTypes.object,
  visit: PropTypes.object,
  slot: PropTypes.object,
  setEvent: PropTypes.func.isRequired,
}
