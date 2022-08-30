import React, { useState, useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { BOOKING_TIME } from '../../../config'
import { Button } from '../../Embeds/Button'
import { Timer } from '../../Embeds/Utils'
import { parseVisitSubmission } from '../../../helpers/parse'
import Form from './Form'
import Info from './Info'
import Status from './Status'
import Steps, { Step } from 'rc-steps'
import { CheckIcon } from '@chakra-ui/icons'
import { notifier } from '../../../helpers/notifier'
import { useUsers, useVisits, useEvents } from '../../../hooks/cache'
import PropTypes from 'prop-types'

const Visit = ({ children }) => {
  const { t } = useTranslation()
  const formId = useId()
  const [phase, setPhase] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [status, setStatus] = useState(false)
  const [timer, setTimer] = useState()
  const [token, setToken] = useState()
  const { add } = useVisits()
  const { remove, lock, unlock, current: event } = useEvents()
  const { current: user } = useUsers()
  const navigate = useNavigate()

  const getTitle = (current) => {
    if (current === 1 && current === phase) {
      if (!timer) return setTimer(<Timer seconds={BOOKING_TIME} />)
      return timer
    }
    if (current === 0) return t('step-check')
    if (current === 1) return t('step-book')
    if (current === 2) return t('step-confirm')
  }

  const increment = () => setPhase(phase + 1)

  const toForm = () => setPhase(1)

  const close = () => {
    if (token) unlock(event.id)
    setToken()
    navigate('/')
  }

  const handleSubmit = async values => {
    increment()
    const result = await add({
      ...parseVisitSubmission(values),
      event: event.id,
      token: token,
    })
    notifier.createVisit(result)
    setStatus(result ? true : false)
  }

  const handleRemove = async () => {
    if (confirm(t('remove-event-confirm'))) {
      if (await remove(event.id)) close()
    }
  }

  if (!event) return <Navigate to='/' />
  const available = !event?.unAvailable && !event?.disabled && !event?.booked && !event.locked && !event?.group?.disabled

  return (
    <Modal
      show={true}
      backdrop='static'
      size='lg'
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{event.title}</Modal.Title>
      </Modal.Header>
      <Modal.Header style={{ display: 'inline' }}>
        {!available ? <Modal.Title
          style={{ color: 'brown', fontWeight: 'bold' }}
        >{t('cannot-be-booked')}</Modal.Title> :
          <Steps current={phase}>
            <Step icons={{ finish: <CheckIcon /> }} title={getTitle(0)} />
            <Step icons={{ finish: <CheckIcon /> }} title={getTitle(1)} />
            <Step icons={{ finish: <CheckIcon /> }} title={getTitle(2)} />
          </Steps>}
      </Modal.Header>
      <Modal.Body>
        {phase === 0 && <Info />}
        <div className={phase === 1 ? 'show-visitform' : 'hide-visitform'}>
          {<Form formId={formId} show={!showInfo} onSubmit={handleSubmit} event={event} />}
          {showInfo && <Info />}
        </div>
        {phase >= 2 && <Status status={status}/>}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }} >
        <div style={{ lineHeight: 3, marginBottom: -5 }}>
          {phase === 0 && <>
            {user && event?.visits?.length === 0 &&
            <Button onClick={handleRemove}>{t('delete-event')}</Button>}
            {children}
            {available && (
              <Button className='active' onClick={async () => {
                increment()
                const token = await lock(event.id)
                if (!token) close()
                else setToken(token)
              }}>{t('book-visit')}</Button>
            )}
          </>}
          {phase === 1 && <>
            <Button id='visit-form-media' onClick={() => setShowInfo(!showInfo)}>{showInfo ? t('show-visit-form') : t('show-info')}</Button>
            <Button id='book' form={formId} type='submit' className='active'>{t('book-visit-submit')}</Button>
          </>}
          {phase === 2 && status === false && <Button onClick={toForm}>{t('back-to-form')}</Button>}
          {phase === 2 && <Button className='active' onClick={close}>{t('book-visit-close')}</Button>}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default Visit

Visit.propTypes = {
  children: PropTypes.node
}
