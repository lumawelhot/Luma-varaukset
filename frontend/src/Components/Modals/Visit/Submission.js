
import React, { useEffect, useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../Embeds/Button'
import Details from './Details'
import Form from './Form'
import Cancellation from './Cancellation'
import { exec } from '../../../helpers/utils'
import { parseVisitSubmission } from '../../../helpers/parse'
import { notifier } from '../../../helpers/notifier'
import { useUsers, useVisits, useEvents } from '../../../hooks/cache'
import { useCloseModal } from '../../../hooks/utils'

const Submission = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { current: visit, findVisit, remove, fetchAll, modify } = useVisits()
  const { findEvent } = useEvents()
  const { current: user } = useUsers()
  const [page, setPage] = useState('details')
  const { id } = useParams()
  const formId = useId()
  useEffect(exec(async () => {
    await fetchAll()
    await findVisit(id)
  }), [])

  const [show, closeModal] = useCloseModal(() => {
    if (window.location.href.includes('/visits')) navigate('/visits')
    else navigate('/')
  })

  const cancelVisit = values => {
    console.log(values)
    if (confirm(t('cancel-confirm'))) {
      remove(visit.id, values)
      closeModal()
    }
  }

  const modifyVisit = async values => {
    const variables = parseVisitSubmission(values)
    const result = await modify({ visit: visit.id, ...variables })
    notifier.modifyVisit(result)
    if (result) setPage('details')
  }

  const event = findEvent(visit?.event?.id)
  if (!event && !visit) return <></>

  return (
    <Modal show={show} backdrop='static' size='lg' onHide={closeModal} scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('you-are-booked-visit')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {page === 'details' && <Details visit={visit} event={event} />}
        {page === 'modify' && <Form formId={formId} show={true} onSubmit={modifyVisit} event={event} visit={visit} />}
        {page === 'cancellation' && <Cancellation formId={formId} show={true} onSubmit={cancelVisit} />}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {visit.status && <>
          {page !== 'details' && <Button onClick={() => setPage('details')}>{t('visit-details')}</Button>}
          {user && page !== 'modify' && page !== 'cancellation'
            && <Button onClick={() => setPage('modify')}>{t('modify')}</Button>}
          {page !== 'modify' && page !== 'cancellation' && <Button onClick={() => setPage('cancellation')} className='active'>{t('cancel-visit')}</Button>}
          {page === 'cancellation' && <Button form={formId} type='submit' className='active'>{t('cancel-visit')}</Button>}
          {page === 'modify'
            && <Button form={formId} type='submit' className='active'>{t('modify')}</Button>}
        </>}
      </Modal.Footer>
    </Modal>
  )
}

export default Submission
