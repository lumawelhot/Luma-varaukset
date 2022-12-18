
import React, { useEffect, useId, useState } from 'react'
import { Modal, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../Embeds/Button'
import Details from './Details'
import Form from './Form'
import Cancellation from './Cancellation'
import { exec } from '../../../helpers/utils'
import { parseVisitSubmission } from '../../../helpers/parse'
import { notifier } from '../../../helpers/notifier'
import { useUsers, useVisits, useEvents, useMisc } from '../../../hooks/cache'
import { useCloseModal } from '../../../hooks/utils'
import Calendar from './Calendar'
import Title from '../../Embeds/Title'
import { format } from 'date-fns'
import { TimePicker } from '../../Embeds/Input'

const Submission = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { current: visit, findVisit, remove, fetchAll, modify } = useVisits()
  const [selectedEvent, setSelectedEvent] = useState()
  const [startTime, setStartTime] = useState()
  const [endTime, setEndTime] = useState()
  const { cancelForm, fetchCancelForm } = useMisc()
  const { findEvent } = useEvents()
  const { current: user } = useUsers()
  const [page, setPage] = useState('details')
  const { id } = useParams()
  const formId = useId()

  useEffect(exec(async () => {
    await fetchAll()
    await findVisit(id)
    await fetchCancelForm()
  }), [])

  const [show, closeModal] = useCloseModal(() => {
    if (window.location.href.includes('/visits')) navigate('/visits')
    else navigate('/')
  })

  const cancelVisit = async values => {
    if (confirm(t('cancel-confirm'))) {
      const result = await remove(visit.id, values)
      notifier.cancelVisit(result)
      closeModal()
    }
  }

  const modifyVisit = async values => {
    const variables = parseVisitSubmission({
      ...values,
      payload: selectedEvent ? {
        event: selectedEvent.id,
        date: selectedEvent.start,
        startTime,
        endTime,
      } : undefined
    })
    const result = await modify({ visit: visit.id, ...variables })
    notifier.modifyVisit(result)
    if (result) setPage('details')
  }

  const handleSetSelected = v => {
    setSelectedEvent(v)
    setStartTime(v?.slot?.start)
    setEndTime(v?.slot?.end)
  }

  const event = findEvent(visit?.event?.id)
  if (!event && !visit) return <></>
  const startHours = selectedEvent?.slot.start.getHours()
  const endHours = selectedEvent?.slot.end.getHours()

  return (
    <Modal show={show} backdrop='static' size='lg' onHide={closeModal} scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        {visit.status
          ? <Modal.Title>{t('you-are-booked-visit')}</Modal.Title>
          : <Modal.Title style={{ color: '#bd4047' }}>{t('visit-cancelled')}</Modal.Title>}
      </Modal.Header>
      <Modal.Body>
        {page === 'details' && <Details visit={visit} event={event} />}
        {page === 'modify' && <Form formId={formId} show={true} onSubmit={modifyVisit} event={event} visit={visit} />}
        {page === 'cancellation' && <Cancellation formId={formId} show={true} onSubmit={cancelVisit} />}
        {page === 'calendar' && <Calendar
          event={selectedEvent}
          setEvent={handleSetSelected}
          slot={{
            start: startTime,
            end: endTime
          }}
        />}
        {page === 'modify' && selectedEvent && <>
          <Title>{t('visit')}: <span style={{ color: 'red' }}>
            {selectedEvent.title}, {format(new Date(selectedEvent.start), 'd.M.yyyy')}</span>
          <div>{t('slot')}: <span style={{ color: 'red' }}>
            {format(new Date(selectedEvent.slot.start), 'HH.mm')} - {format(new Date(selectedEvent.slot.end), 'HH.mm')}
          </span></div>
          </Title>
          <Stack direction='horizontal'>
            <TimePicker
              title={t('start-time')}
              value={startTime}
              hideHours={hour =>
                hour < startHours ||
                hour > endHours - 1
              }
              hideMinutes={minute => minute % 5 !== 0}
              onChange={v => setStartTime(new Date(v), { seconds: 0, milliseconds: 0 })}
            />
            <div style={{ marginLeft: 10 }}>
              <TimePicker
                title={t('end-time')}
                value={endTime}
                hideHours={hour =>
                  hour < startHours ||
                  hour > endHours - 1
                }
                hideMinutes={minute => minute % 5 !== 0}
                onChange={v => setEndTime(new Date(v), { seconds: 0, milliseconds: 0 })}
              />
            </div>
          </Stack>
        </>}
        {page === 'modify' && <Button
          style={{ marginTop: 10, marginLeft: 0 }}
          onClick={() => setPage('calendar')}
        >{t('modify-date')}</Button>}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {visit.status && <>
          {page !== 'details' && page !== 'calendar' && <Button onClick={() => setPage('details')}>{t('visit-details')}</Button>}
          {user && page !== 'modify' && page !== 'cancellation'
            && <Button onClick={() => setPage('modify')}>{t('modify')}</Button>}
          {page !== 'modify' && page !== 'cancellation' && page !== 'calendar' && <Button onClick={() => {
            if (cancelForm === null) cancelVisit()
            else setPage('cancellation')
          }} className='active'>{t('cancel-visit')}</Button>}
          {page === 'cancellation' && <Button form={formId} type='submit' className='active'>{t('cancel-visit')}</Button>}
          {page === 'modify'
            && <Button form={formId} type='submit' className='active'>{t('modify')}</Button>}
        </>}
      </Modal.Footer>
    </Modal>
  )
}

export default Submission
