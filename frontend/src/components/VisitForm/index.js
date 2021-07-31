import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { CREATE_VISIT, EVENTS, GET_FORM } from '../../graphql/queries'
import Form from './Form'

const calculateVisitEndTime = (startTimeAsDate, values, selectedEvent, extras) => {
  const selectedExtrasDurationsInPerson = extras.length ? selectedEvent.extras
    .filter(e => extras.includes(e.id))
    .reduce((acc,val) => acc + val.inPersonLength, 0)
    : 0

  const selectedExtrasDurationsRemote = extras.length ? selectedEvent.extras
    .filter(e => extras.includes(e.id))
    .reduce((acc,val) => acc + val.remoteLength, 0)
    : 0

  const visitDurationWithExtras = values.visitMode === '1' ?
    selectedEvent.duration + selectedExtrasDurationsRemote
    : values.visitMode === '2' ?
      selectedEvent.duration + selectedExtrasDurationsInPerson
      : values.visitMode === '0' && selectedEvent.inPersonVisit !== selectedEvent.remoteVisit ?
        selectedEvent.inPersonVisit ?
          selectedEvent.duration + selectedExtrasDurationsInPerson
          : selectedEvent.duration + selectedExtrasDurationsRemote
        : selectedEvent.duration
  const visitEndTime = new Date(startTimeAsDate.getTime() + visitDurationWithExtras*60000)

  return visitEndTime
}

export const VisitForm = ({ sendMessage, event, token }) => {
  const { t } = useTranslation('event')
  const history = useHistory()

  const [customFormFields, setCustomFormFields] = useState(null)

  const { loading, error, data } = event.customForm ? useQuery(GET_FORM, {
    variables: { id: event.customForm },
    onError: (error) => console.log('virheviesti: ', error),
  })
    : { loading: null, error: null, data: null }

  const [create, result] = useMutation(CREATE_VISIT, {
    refetchQueries: [{ query: EVENTS }],
    onError: (error) => {
      console.log(error)
      if (error.message === 'File not found') {
        sendMessage(t('failed-to-book-visit'), 'danger')
      } else {
        sendMessage(t('given-info-is-invalid'), 'danger')
      }
    }
  })

  useEffect(() => {
    if (data?.getForm) setCustomFormFields(JSON.parse(data.getForm.fields))
  },[data])

  const validate = (values, selectedEvent, eventPlatforms) => {
    const messageIfMissing = t('is-required')
    const messageIfTooShort = t('too-short')
    const errors = {}
    if (!values.clientName) {
      errors.clientName = messageIfMissing
    }
    if (values.clientName.length < 5) {
      errors.clientName = messageIfTooShort
    }
    if (!values.schoolName) {
      errors.schoolName = messageIfMissing
    }
    if (values.schoolName.length < 5) {
      errors.schoolName = messageIfTooShort
    }
    if (!values.schoolLocation) {
      errors.schoolLocation = messageIfMissing
    }
    if (!values.clientEmail) {
      errors.clientEmail = messageIfMissing
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.clientEmail)) {
      errors.clientEmail = t('email-error')
    }
    if (!values.verifyEmail || values.verifyEmail !== values.clientEmail) {
      errors.verifyEmail = t('email-confirm-error')
    }
    if (!values.clientPhone) {
      errors.clientPhone = messageIfMissing
    }
    if (!values.visitGrade) {
      errors.visitGrade = messageIfMissing
    }
    if (!values.participants) {
      errors.participants = messageIfMissing
    }
    if ((values.visitMode === '0') && (selectedEvent.inPersonVisit && selectedEvent.remoteVisit)) {
      errors.location = t('remote-or-inperson-error')
    }
    if(!values.privacyPolicy){
      errors.privacyPolicy = t('accept-privacy')
    }
    if(!values.remoteVisitGuidelines){
      errors.remoteVisitGuidelines = t('remember-read')
    }
    const startTimeAsDate = (typeof values.startTime === 'object') ? values.startTime : new Date(selectedEvent.start)
    if (typeof values.startTime === 'string') {
      startTimeAsDate.setHours(values.startTime.slice(0,2))
      startTimeAsDate.setMinutes(values.startTime.slice(3,5))
    }
    const visitEndTime = calculateVisitEndTime(startTimeAsDate, values, selectedEvent, values.extras)
    if (visitEndTime > selectedEvent.end) {
      errors.startTime = t('outside-timeslot')
    }
    if (startTimeAsDate < selectedEvent.start) {
      errors.startTime = t('start-too-early')
    }
    if(values.visitMode !== '2' && !values.otherRemotePlatformOption && Number(values.remotePlatform) === eventPlatforms.length+1){
      errors.otherRemotePlatformOption = t('write-other-platform')
    }
    return errors
  }

  const parseCustomFormData = (values) => {
    if (!customFormFields) return null
    return JSON.stringify(customFormFields.map((f,index) => {
      return {
        name: f.name,
        value: values['custom-' + index]
      }
    }))
  }

  const onSubmit = (values, eventPlatforms) => {
    try {
      const remoteVisit = (values.visitMode === '0')? event.remoteVisit : (values.visitMode === '1') ? true : false
      const inPersonVisit = (values.visitMode === '0')? event.inPersonVisit : (values.visitMode === '2') ? true : false

      const remotePlatform = Number(values.remotePlatform) === 0
        ? ''
        : values.remotePlatform <= eventPlatforms.length ?
          eventPlatforms[Number(values.remotePlatform)]
          : values.otherRemotePlatformOption

      const customFormData = parseCustomFormData(values)

      create({
        variables: {
          event: event.id,
          clientName: values.clientName,
          schoolName: values.schoolName,
          remoteVisit: remoteVisit,
          inPersonVisit: inPersonVisit,
          schoolLocation: values.schoolLocation,
          startTime: values.startTime.toISOString(),
          endTime: values.finalEndTime.toISOString(),
          clientEmail: values.clientEmail,
          clientPhone: values.clientPhone,
          grade: values.visitGrade,
          participants: values.participants,
          dataUseAgreement: values.dataUseAgreement,
          extras: values.extras,
          remotePlatform: remotePlatform,
          token,
          customFormData: customFormData
        }
      })
    } catch (error) {
      sendMessage(t('failed-to-book'), 'danger')
    }
  }

  useEffect(() => {
    if (result.data) {
      sendMessage(`${t('booked-successfully')} ${result.data.createVisit.clientEmail}.`, 'success')
      history.push('/' + result.data.createVisit.id)
    }
  }, [result.data])

  if (!event) {
    return (
      <div>{t('searching-event')}</div>
    )
  }

  if (loading) return <p className="notification">Searching form...</p>
  if (error) return <p className="notification">{t('error')}</p>

  return (
    <Form
      sendMessage={sendMessage}
      event={event}
      validate={validate}
      calculateVisitEndTime={calculateVisitEndTime}
      onSubmit={onSubmit}
      customFormFields={customFormFields}
    />
  )
}