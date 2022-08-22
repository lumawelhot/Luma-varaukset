
import React, { useEffect, useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../Embeds/Button'
import { useEvents } from '../../../hooks/api'
import Details from './Details'
import Form from './Form'
import { exec } from '../../../helpers/utils'
import { parseVisitSubmission } from '../../../helpers/parse'
import { notifier } from '../../../helpers/notifier'
import { useUsers, useVisits } from '../../../hooks/cache'

const Submission = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { current: visit, find, remove, fetchAll, modify } = useVisits()
  const { find : findEvent } = useEvents()
  const { current: user } = useUsers()
  const [page, setPage] = useState('details')
  const { id } = useParams()
  const formId = useId()
  useEffect(exec(async () => {
    await fetchAll()
    await find(id)
  }), [])

  const toVisits = () => {
    if (window.location.href.includes('/visits')) navigate('/visits')
    else navigate('/')
  }

  const cancelVisit = () => {
    if (confirm(t('cancel-confirm'))) {
      remove(visit.id)
      toVisits()
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
    <Modal
      show={true}
      backdrop='static'
      size='lg'
      onHide={toVisits}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('you-are-booked-visit')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {page === 'details' && <Details visit={visit} event={event} />}
        {page === 'modify' && <Form formId={formId} show={true} onSubmit={modifyVisit} event={event} visit={visit} />}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {visit.status && <>
          {page !== 'details' && <Button onClick={() => setPage('details')}>{t('visit-details')}</Button>}
          {user && page !== 'modify' && <Button onClick={() => setPage('modify')}>{t('modify')}</Button>}
          {page !== 'modify' && <Button onClick={cancelVisit} className='active'>{t('cancel-visit')}</Button>}
          {page === 'modify' && <Button form={formId} type='submit' className='active'>{t('modify')}</Button>}
        </>}
      </Modal.Footer>
    </Modal>
  )
}

export default Submission
