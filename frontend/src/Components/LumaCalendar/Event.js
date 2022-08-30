import React from 'react'
import { OverlayTrigger, Popover, PopoverHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BsEyeSlashFill } from 'react-icons/bs'
import { FaLock } from 'react-icons/fa'
import { CLASSES, LANGUAGE_SHORT } from '../../config'
import { Badge } from '../Embeds/Utils'
import { useEvents } from '../../hooks/cache'
import PropTypes from 'prop-types'

const Event = ({ content }) => {
  const { findEvent, selected } = useEvents()
  const { t } = useTranslation()
  const event = findEvent(content.event._def.publicId)
  const unavailableColor = '#bd4047'

  if (!event) return <></>

  const isSelected = selected.includes(event.id)
  const details = content.event._def.extendedProps
  const { disabled } = event
  const groupFull = event?.group?.disabled
  const { locked, booked } = details
  const view = content.view.type
  const published = event?.publishDate ? new Date() >= new Date(event.publishDate) : true
  const passed = !disabled && !booked && details.unAvailable

  const getTimeRange = () => {
    const start = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(event.start))
    const end = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(new Date(event.end))
    return `${start} - ${end}`
  }

  const showEvent = () => (disabled || groupFull || !published) && !booked

  const popover = () => (
    <Popover>
      <PopoverHeader
        style={{ padding: 10, paddingTop: 5, paddingBottom: 5, fontSize: 13, fontWeight: 'bold' }}
      >
        {booked && <span style={{ color: unavailableColor, marginRight: 15 }}>{t('booked')}</span>}
        {passed && <span style={{ color: unavailableColor, marginRight: 15 }}>{t('passed')}</span>}
        <span>{getTimeRange()}</span>
        <span style={{ marginLeft: 15 }}>{event.title}</span>
        <span style={{ marginLeft: 15 }}>{`(${event.languages?.map(l => LANGUAGE_SHORT[l]).join(', ')})`}</span>
      </PopoverHeader>
      <Popover.Body style={{ padding: 10, paddingTop: 5, paddingBottom: 5 }}>
        {event.tags.map((t, i) => <Badge
          style={{ marginRight: 5, marginLeft: 0, fontSize: 11 }}
          key={i}
          bg='info'
        >{t.name}</Badge>)}
        <ul style={{ marginTop: 5, listStyle: 'none' }}>
          {event.resourceids.map((r, i) => <li key={i}>
            <span>{CLASSES[Number(r) - 1].label}</span>
            <span style={{ marginLeft: 10 }}>({t(CLASSES[Number(r) - 1].i18n)})</span>
          </li>)}
        </ul>
        <div style={{ marginTop: 5, fontSize: 13, fontStyle: 'italic' }}>
          {event?.desc?.length > 200 ? `${event.desc.slice(0, 200)}...` : event.desc}
        </div>
      </Popover.Body>
    </Popover>
  )

  if (view === 'dayGridMonth') return (
    <OverlayTrigger placement='auto-start' overlay={popover()} delay={700}>
      <div className='event-overlay' style={{ overflow: 'hidden' }}>
        <span
          className='fc-list-event-dot'
          style={{ borderColor: content.borderColor }}
        />
        <span style={{ marginLeft: 3, fontSize: 12 }}>{event.title}</span>
      </div>
    </OverlayTrigger>
  )

  return (
    <OverlayTrigger placement='top-start' overlay={popover()} delay={700}>
      <div className='event-overlay' style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <div>
          {!locked && showEvent() && <BsEyeSlashFill
            size={15}
            style={{ margin: 5, marginTop: 2, display: 'inline', color: isSelected ? '#b8b8b8' : 'inherit' }}
          />}
          {locked && <FaLock size={15} style={{ margin: 5, marginTop: 2, display: 'inline' }} />}
          <span>{booked ? <span style={{ color: unavailableColor, marginRight: 10 }}>{t('booked')}</span> : ''}</span>
          <span>{passed ? <span style={{ color: unavailableColor, marginRight: 10 }}>{t('passed')}</span> : ''}</span>
          <span>{((disabled || groupFull) && !booked && !passed) ?
            <span style={{ color: unavailableColor, marginRight: 10 }}>{t('disabled')}</span>
            : ''}</span>
          <span>{(!published && !booked && !passed) ?
            <span style={{ color: unavailableColor, marginRight: 10 }}>{t('unpublished')}</span>
            : ''}</span>
          <span style={{ color: isSelected ? '#b8b8b8' : 'inherit' }}>{event.title}</span>
        </div>
        <div style={{ color: isSelected ? '#b8b8b8' : 'inherit' }}>{content.timeText}</div>
      </div>
    </OverlayTrigger>
  )
}

export default Event

Event.propTypes = {
  content: PropTypes.object.isRequired
}
