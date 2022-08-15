import React, { useState, useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { BOOKING_TIME } from '../../../config'
import { Button } from '../../Embeds/Button'
import Timer from '../../Embeds/Timer'
import { combineEvent } from '../../../helpers/parse'
import Form from './Form'
import Info from './Info'
import Status from './Status'
import Steps, { Step } from 'rc-steps'
import { CheckIcon } from '@chakra-ui/icons'
import { error, success } from '../../../helpers/toasts'
import { useEvents, useUser, useVisits } from '../../../hooks/api'

const Visit = ({ children }) => {
  const { t } = useTranslation()
  const formId = useId()
  const [phase, setPhase] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [status, setStatus] = useState()
  const [timer, setTimer] = useState()
  const [token, setToken] = useState()
  const [visit, setVisit] = useState()
  const { book } = useVisits()
  const { cacheModify, find, remove, lock, unlock, current: event } = useEvents()
  const { current: user } = useUser()
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
    const fieldValues = Object.fromEntries(Object.entries(values)
      .filter(e => e[0].includes('custom-'))
      .map(e => [Number(e[0].split('-')[1]), e[1]]))
    const otherRemote = values.otherRemotePlatformOption
    const type = values.visitType
    const customFormData = JSON.stringify(values.customFormData?.map((c, i) => {
      return { ...c, value: fieldValues[i] }
    }))
    const inPersonVisit = type === 'inperson' ? true : false
    const remoteVisit = type === 'remote' ? true : false
    const remotePlatform = otherRemote?.length ? otherRemote : values.remotePlatform
    const variables = {
      ...values,
      event: event.id,
      token: token,
      inPersonVisit,
      remoteVisit,
      customFormData,
      remotePlatform
    }
    increment()
    const result = await book(variables)
    if (result?.event) {
      setVisit(result)
      const found = find(result.event.id)
      cacheModify(combineEvent(result, found))
      success(t('notify-booking-success'))
    } else error(t('notify-booking-failed'))
    setStatus(result ? true : false)
  }

  const handleRemove = async () => {
    if (confirm(t('remove-event-confirm'))) {
      const result = remove(event.id)
      if (result) close()
    }
  }

  if (!event) return <Navigate to='/' />

  return (
    <Modal
      show={true}
      backdrop="static"
      size="lg"
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{event.title}</Modal.Title>
      </Modal.Header>
      <Modal.Header style={{ display: 'inline' }}>
        {(event?.disabled || event?.booked || event?.locked || event.unAvailable || event?.group?.disabled) ? <Modal.Title
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
          {<Form formId={formId} show={!showInfo} onSubmit={handleSubmit} />}
          {showInfo && <Info />}
        </div>
        {phase >= 2 && <Status status={status} visit={visit}/>}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }} >
        <div style={{ lineHeight: 3, marginBottom: -5 }}>
          {phase === 0 && <>
            {user && event?.visits?.length === 0 &&
            <Button onClick={handleRemove}>{t('delete-event')}</Button>}
            {children}
            {!event?.unAvailable && !event?.disabled && !event?.booked && !event.locked && !event?.group?.disabled && (
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
            <Button form={formId} type='submit' className='active'>{t('book-visit-submit')}</Button>
          </>}
          {phase === 2 && status === false && <Button onClick={toForm}>{t('back-to-form')}</Button>}
          {phase === 2 && <Button className='active' onClick={close}>{t('book-visit-close')}</Button>}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default Visit
