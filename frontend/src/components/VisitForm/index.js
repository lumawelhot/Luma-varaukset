import { useMutation } from '@apollo/client'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { CREATE_VISIT, EVENTS } from '../../graphql/queries'
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

const validate = (values, selectedEvent, eventPlatforms) => {
  const messageIfMissing = 'Vaaditaan!'
  const messageIfTooShort = 'Liian lyhyt!'
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
    errors.clientEmail = 'Tarkista sähköpostiosoite!'
  }
  if (!values.verifyEmail || values.verifyEmail !== values.clientEmail) {
    errors.verifyEmail = 'Sähköpostit eivät täsmää!'
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
    errors.location = 'Valitse joko etä- tai lähivierailu!'
  }
  if(!values.privacyPolicy){
    errors.privacyPolicy = 'Hyväksy tietosuojailmoitus!'
  }
  if(!values.remoteVisitGuidelines){
    errors.remoteVisitGuidelines = 'Luethan ohjeet!'
  }
  const startTimeAsDate = (typeof values.startTime === 'object') ? values.startTime : new Date(selectedEvent.start)
  if (typeof values.startTime === 'string') {
    startTimeAsDate.setHours(values.startTime.slice(0,2))
    startTimeAsDate.setMinutes(values.startTime.slice(3,5))
  }
  const visitEndTime = calculateVisitEndTime(startTimeAsDate, values, selectedEvent, values.extras)
  if (visitEndTime > selectedEvent.end) {
    errors.startTime = 'Varaus ei mahdu aikaikkunaan'
  }
  if (startTimeAsDate < selectedEvent.start) {
    errors.startTime = 'Liian aikainen aloitusaika'
  }
  if(values.visitMode !== '2' && !values.otherRemotePlatformOption && Number(values.remotePlatform) === eventPlatforms.length+1){
    errors.otherRemotePlatformOption = 'Kirjoita muun etäyhteysalustan nimi'
  }
  return errors
}



export const VisitForm = ({ sendMessage, event }) => {
  const history = useHistory()

  const [create, result] = useMutation(CREATE_VISIT, {
    refetchQueries: [{ query: EVENTS }],
    onError: (error) => {
      if (error.message === 'File not found') {
        sendMessage('Vahvistusviestin lähettäminen epäonnistui! Vierailun varaaminen ei onnistunut.', 'danger')
      } else {
        sendMessage('Annetuissa tiedoissa on virhe! Vierailun varaaminen ei onnistunut.', 'danger')
      }
      console.log('virheviesti: ', error, result)
    }
  })

  const onSubmit = (values, eventPlatforms) => {
    try {
      const remoteVisit = (values.visitMode === '0')? event.remoteVisit : (values.visitMode === '1') ? true : false
      const inPersonVisit = (values.visitMode === '0')? event.inPersonVisit : (values.visitMode === '2') ? true : false

      const remotePlatform = Number(values.remotePlatform) === 0
        ? ''
        : values.remotePlatform <= eventPlatforms.length ?
          eventPlatforms[Number(values.remotePlatform)]
          : values.otherRemotePlatformOption

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
        }
      })
    } catch (error) {
      sendMessage('Varauksen teko epäonnistui.', 'danger')
    }
  }

  useEffect(() => {
    if (result.data) {
      sendMessage(`Varaus on tehty onnistuneesti! Varauksen tiedot on lähetetty sähköpostiosoitteeseenne ${result.data.createVisit.clientEmail}.`, 'success')
      history.push('/' + result.data.createVisit.id)
    }
  }, [result.data])

  if (!event) {
    return (
      <div>Vierailua haetaan...</div>
    )
  }

  return (
    <Form
      sendMessage={sendMessage}
      event={event}
      validate={validate}
      calculateVisitEndTime={calculateVisitEndTime}
      onSubmit={onSubmit}
    />
  )
}