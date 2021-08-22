import React, { useState } from 'react'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import format from 'date-fns/format'
import { useHistory } from 'react-router'
import { useMutation } from '@apollo/client'
import { DELETE_EVENT, DISABLE_EVENT, ENABLE_EVENT, EVENTS } from '../graphql/queries'
import { ModifyEvent } from './ModifyEventModal'
import { useTranslation } from 'react-i18next'

const EventPage = ({ event, handleBookingButtonClick, currentUser, sendMessage, setEvent, tags }) => {
  const { t } = useTranslation('event')
  const history = useHistory()

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => {
      sendMessage(t('cannot-remove'), 'danger')
    },
    onCompleted: () => {
      sendMessage(t('remove-success'), 'success')
      history.push('/')
    }
  })
  const [disableEvent] = useMutation(DISABLE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => {
      sendMessage(t('failed-to-disable'), 'danger')
    },
    onCompleted: ({ disableEvent }) => {
      setEvent({
        ...event,
        disabled: disableEvent.disabled
      })
      sendMessage(t('event-disabled'), 'success')
    }
  })
  const [enableEvent] = useMutation(ENABLE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => {
      sendMessage(t('failed-to-enable'), 'danger')
    },
    onCompleted: ({ enableEvent }) => {
      setEvent({
        ...event,
        disabled: enableEvent.disabled
      })
      sendMessage(t('event-enabled'), 'success')
    }
  })

  const [showModal, setShowModal] = useState(false)

  if (!event) {
    history.push('/')
  }

  const classes = [
    { value: 1, label: 'SUMMAMUTIKKA' },
    { value: 2, label: 'FOTONI' },
    { value: 3, label: 'LINKKI' },
    { value: 4, label: 'GEOPISTE' },
    { value: 5, label: 'GADOLIN' }
  ]

  const filterEventClass = (eventClasses) => {
    const classesArray = eventClasses.map(c => classes[c-1].label)
    return classesArray.join(', ')
  }

  const handleRemoveEventClick = () => {
    if (confirm(t('remove-confirm'))) {
      deleteEvent({
        variables: {
          id: event.id
        }
      })
    }
  }

  const filterEventGrades = (eventGrades) => {
    const returnArray = []
    eventGrades.forEach(availableGrade => {
      grades.forEach(grade => {
        if (availableGrade === grade.value) {
          returnArray.push({ value: grade.value, label: grade.label })
        }
      })
    })
    return returnArray
  }

  const grades = [
    { value: 1, label: 'varhaiskasvatus' },
    { value: 2, label: '1.-2. luokka' },
    { value: 3, label: '3.-6. luokka' },
    { value: 4, label: '7.-9 luokka' },
    { value: 5, label: 'toinen aste' }
  ]

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleDisable = () => {
    disableEvent({
      variables: {
        event: event.id
      }
    })
  }

  const handleEnable = () => {
    enableEvent({
      variables: {
        event: event.id
      }
    })
  }

  if (event) {
    const eventClass = filterEventClass(event.resourceids)
    const eventGrades = filterEventGrades(event.grades)

    const startsAfter14Days = differenceInDays(event.start, new Date()) >= 14
    const startsAfter1Hour = differenceInMinutes(event.start, new Date()) >= 60
    const description = event.desc ? event.desc : null
    console.log(event)
    return (
      <>
        <div className={`modal ${showModal ? 'is-active':''}`}>
          <div className="modal-background"></div>
          {showModal && <ModifyEvent
            event={event}
            setEvent={setEvent}
            close={() => closeModal()}
            sendMessage={sendMessage}
            tags={tags}
          />}
        </div>
        <div className="container">
          <div className="columns is-centered">
            <div className="section">
              <div className="box">
                <div className="content">
                  <div className="title" style={event.disabled ? { color: 'red' } : null}>{event.title}{event.disabled ? ` - ${t('disabled')}` : null}</div>
                  <div className="tags eventpage">
                    {event.tags.map(t => <span key={t.id} className="tag is-small luma">{t.name}</span>)}
                  </div>
                  <div>
                    {description
                      ? <p><strong>{t('description')}:</strong> {description} </p>
                      : null}
                    <p><strong>{t('science-class')}:</strong> {eventClass}</p>
                    {event.extras.length
                      ? <div>
                        <strong>{t('available-extras')}:</strong>
                        <ul>
                          {event.extras.map(extra => <li key={extra.name}>{extra.name}</li>) }
                        </ul>
                        <br/>
                      </div>
                      : null}
                    <div>
                      <strong>{t('available-to-grades')}:</strong>
                      <ul>
                        {eventGrades.map(g => <li key={g.value}>{g.label}</li>)}
                      </ul>
                    </div>
                    <br/>
                    <p><strong>{t('event-on-offer')}: </strong>
                      {event.inPersonVisit ? t('in-inperson') : <></>}
                      {event.inPersonVisit && event.remoteVisit && t('and-remote')}
                      {event.remoteVisit && !event.inPersonVisit? t('in-remote') : <></>}
                    </p>
                    <p><strong>{t('event-date')}:</strong> {format(event.start, 'd.M.yyyy')}</p>
                    <p><strong>{t('event-start')}:</strong> {format(event.start, 'HH:mm')}</p>
                    <p><strong>{t('event-end')}:</strong> {format(event.end, 'HH:mm')}</p>
                    <p><strong>{t('length')}:</strong> {event.duration} {t('minutes')} </p>
                    {event.locked || event.booked || (currentUser && !startsAfter1Hour) || (!currentUser && !startsAfter14Days) ?
                      <p className="subtitle unfortunately"><b>{t('cannot-be-booked')}</b></p> : null}
                    <div className="field is-grouped is-grouped-multiline">
                      {event.locked || event.booked || (currentUser && !startsAfter1Hour) || (!currentUser && !startsAfter14Days)
                        ? null :
                        !event.disabled &&
                        <div className="control">
                          <button id="booking-button" className="button luma primary" onClick={() => handleBookingButtonClick()}>
                            {t('book-event')}
                          </button>
                        </div>
                      }
                      <div className="control">
                        <button className="button luma" onClick={cancel}>{t('to-calendar')}</button>
                      </div>
                    </div>
                    <div className="field is-grouped is-grouped-multiline">
                      {!!currentUser && <>
                        <div className="control">
                          <button className="button luma" onClick={openModal}>{t('change-info')}</button>
                        </div>
                        <div className="control">
                          <button id="remove" className="button luma" onClick={() => handleRemoveEventClick()}>{t('remove-event')}</button>
                        </div>
                        {!event.booked && event.disabled &&
                          <div className="control">
                            <button className="button luma" onClick={handleEnable}>{t('enable-event')}</button>
                          </div>
                        }
                        {!event.booked && !event.disabled &&
                          <div className="control">
                            <button className="button luma" onClick={handleDisable}>{t('disable-event')}</button>
                          </div>
                        }
                      </>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
  return (
    <div>Vierailua haetaan...</div>
  )
}

export default EventPage