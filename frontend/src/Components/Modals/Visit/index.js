import React, { useContext, useState, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { BOOKING_TIME } from '../../../config'
import { Button } from '../../../Embeds/Button'
import Timer from '../../../Embeds/Timer'
import { combineEvent } from '../../../helpers/parse'
import { EventContext, VisitContext, UserContext } from '../../../services/contexts'
import Form from './Form'
import Info from './Info'
import Status from './Status'
import { formError, customFormError } from '../../../helpers/utils'
import Steps, { Step } from 'rc-steps'
import { CheckIcon } from '@chakra-ui/icons'
import { error, success } from '../../../helpers/toasts'


const Visit = ({ children }) => {
  const { t } = useTranslation()
  const [phase, setPhase] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [status, setStatus] = useState()
  const [timer, setTimer] = useState()
  const [token, setToken] = useState()
  const [visit, setVisit] = useState()
  const { book } = useContext(VisitContext)
  const { cacheModify, find, remove, lock, unlock } = useContext(EventContext)
  const { current: user } = useContext(UserContext)
  const { current: event } = useContext(EventContext)
  const navigate = useNavigate()
  const formRef = useRef()

  const getTitle = (current) => {
    if (current === 1 && current === phase) {
      if (!timer) return setTimer(<Timer seconds={BOOKING_TIME} />)
      return timer
    }
    else if (current > phase) return t('waiting')
    else if (current === phase) return t('inprogress')
    else return t('finished')
  }

  const increment = () => setPhase(phase + 1)
  const close = () => {
    if (token) unlock(event.id)
    setToken(undefined)
    navigate('/')
  }

  const handleSubmit = async () => {
    const values = formRef.current.values
    const type = values.visitType
    const customFormData = JSON.stringify(values.customFormData)
    const inPersonVisit = type === 'inperson' ? true : false
    const remoteVisit = type === 'remote' ? true : false
    const variables = {
      ...values,
      event: event.id,
      token: token,
      inPersonVisit,
      remoteVisit,
      customFormData
    }
    // this should be defined here, otherwise we are getting an error
    if (await formError(formRef.current)) return
    if (await customFormError(event?.customForm?.fields, values.customFormData)) return
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
        {(event?.disabled || event?.booked || event?.locked) && <Modal.Title
          style={{ color: 'brown', fontWeight: 'bold' }}
        >{t('cannot-be-booked')}</Modal.Title>}
        {!event?.disabled && !event?.booked && !event?.locked && <Steps current={phase}>
          <Step icons={{ finish: <CheckIcon /> }} title={getTitle(0)} />
          <Step icons={{ finish: <CheckIcon /> }} title={getTitle(1)} />
          <Step icons={{ finish: <CheckIcon /> }} title={getTitle(2)} />
        </Steps>}
      </Modal.Header>
      <Modal.Body>
        {phase === 0 && <Info />}
        {phase === 1 && <>
          {<Form ref={formRef} show={!showInfo} />}
          {showInfo && <Info />}
        </>}
        {phase >= 2 && <Status status={status} visit={visit}/>}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }} >
        <div style={{ lineHeight: 3, marginBottom: -5 }}>
          {phase === 0 && <>
            {user && event?.visits?.length === 0 &&
            <Button onClick={handleRemove}>{t('delete-event')}</Button>}
            {children}
            {!event?.disabled && !event?.booked && !event.locked && <Button className='active' onClick={async () => {
              increment()
              const token = await lock(event.id)
              if (!token) close()
              else setToken(token)
            }}>{t('book-visit')}</Button>}
          </>}
          {phase === 1 && <>
            <Button id='visit-form-media' onClick={() => setShowInfo(!showInfo)}>{showInfo ? t('show-visit-form') : t('show-info')}</Button>
            <Button type='submit' className='active' onClick={handleSubmit}>{t('book-visit-submit')}</Button>
          </>}
          {phase === 2 && <Button className='active' onClick={close}>{t('book-visit-close')}</Button>}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default Visit
