import React, { useContext } from 'react'
import { Badge, OverlayTrigger, Popover, PopoverHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { BsEyeSlashFill } from 'react-icons/bs'
import { FaLock } from 'react-icons/fa'
import { CLASSES, LANGUAGE_SHORT } from '../../config'
import { EventContext } from '../../services/contexts'

const Event = ({ content }) => {
  const { find } = useContext(EventContext)
  const { t } = useTranslation()
  const event = find(content.event._def.publicId)

  if (!event) return <></>

  const props = content.event._def.extendedProps
  const disabled = event.disabled
  const groupFull = event?.group?.disabled
  const locked = props.locked
  const booked = props.booked
  const view = content.view.type
  const published = event?.publishDate ? new Date() >= new Date(event.publishDate) : true

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
        {booked && <span style={{ color: 'red', marginRight: 15 }}>{t('booked')}</span>}
        <span>{getTimeRange()}</span>
        <span style={{ marginLeft: 15 }}>{event.title}</span>
        <span style={{ marginLeft: 15 }}>{`(${event.languages?.map(l => LANGUAGE_SHORT[l]).join(', ')})`}</span>
      </PopoverHeader>
      <Popover.Body style={{ padding: 10, paddingTop: 5, paddingBottom: 5 }}>
        {event.tags.map((t, i) => <Badge
          style={{ color: 'black', marginRight: 5, marginLeft: 5, fontSize: 11 }}
          key={i}
          bg="info"
        >{t.name}</Badge>)}
        <ul style={{ marginTop: 5, listStyle: 'none' }}>
          {event.resourceids.map((r, i) => <li key={i}>
            <span>{CLASSES[Number(r) - 1].label}</span>
            <span style={{ marginLeft: 10 }}>({CLASSES[Number(r) - 1].i18n})</span>
          </li>)}
        </ul>
        <div style={{ marginTop: 5, fontSize: 13, fontStyle: 'italic' }}>{event.desc}</div>
      </Popover.Body>
    </Popover>
  )

  if (view === 'dayGridMonth') return (
    <OverlayTrigger
      placement='top'
      overlay={popover()}
      delay={500}
    >
      <div style={{ overflow: 'hidden' }}>
        <span
          className='fc-list-event-dot'
          style={{ borderColor: content.borderColor }}
        />
        <span style={{ marginLeft: 3, fontSize: 12 }}>{event.title}</span>
      </div>
    </OverlayTrigger>
  )

  return (
    <OverlayTrigger
      placement='top'
      overlay={popover()}
      delay={400}
    >
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <div>
          {!locked && showEvent() && <BsEyeSlashFill size={15} style={{ margin: 5, marginTop: 2, display: 'inline' }} />}
          {locked && <FaLock size={15} style={{ margin: 5, marginTop: 2, display: 'inline' }} />}
          <span>{booked ? <span style={{ color: 'red', marginRight: 10 }}>{t('booked')}</span> : ''}</span>{event.title}
        </div>
        <div>{content.timeText}</div>
      </div>
    </OverlayTrigger>
  )
}

export default Event
