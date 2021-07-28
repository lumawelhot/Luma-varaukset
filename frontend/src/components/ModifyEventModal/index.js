import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EVENTS, UPDATE_EVENT } from '../../graphql/queries'
import Form from './Form'

export const ModifyEvent = ({ event, close, setEvent, sendMessage, tags }) => {
  const { t } = useTranslation('event')

  const validate = (values) => {
    const defErrorMessage = t('fill-field')
    const errors = {}

    if (!values.title) {
      errors.title = defErrorMessage
    }

    if (!values.grades.includes(true)) {
      errors.gradesError = t('choose-one-grade')
    }

    if (!values.scienceClass.includes(true)) {
      errors.scienceClassError = t('choose-one-resource')
    }

    if(!values.remotePlatforms.includes(true) && values.remoteVisit){
      errors.remoteError = t('choose-one-platform')
    }
    if(!values.otherRemotePlatformOption && values.remotePlatforms[3] && values.remoteVisit){
      errors.otherRemotePlatformOption = t('write-other-platform')
    }

    if (!(values.remoteVisit || values.inPersonVisit)) {
      errors.location = t('remote-or-inperson-error')
    }

    if (!values.startTime) {
      errors.startTime = defErrorMessage
    } else if (values.startTime.getHours() < 8 || values.startTime.getHours() > 16) {
      errors.startTime = t('start-between')
    }

    if (!values.endTime) {
      errors.endTime = defErrorMessage
    } else if (values.startTime > values.endTime) {
      errors.endTime = t('end-after-start')
    } else if (values.endTime.getHours() > 16 && values.endTime.getMinutes() !== 0) {
      errors.endTime = t('end-before')
    }

    if (event.invalidTimeSlot) {
      if (values.startTime.getTime() > event.invalidTimeSlot.start.getTime()) {
        errors.startTime = `${t('start-before')} ${format(event.invalidTimeSlot.start, 'HH.mm')}`
      }
      if (values.endTime.getTime() < event.invalidTimeSlot.end.getTime()) {
        errors.endTime = `${t('end-after')} ${format(event.invalidTimeSlot.end, 'HH.mm')} ${t('after')}`
      }
    }

    return errors
  }

  const [create] = useMutation(UPDATE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onCompleted: ({ modifyEvent }) => {
      const start = new Date(modifyEvent.start)
      const end = new Date(modifyEvent.end)
      setEvent({
        ...event,
        ...modifyEvent,
        start,
        end
      })
      close()
    },
    onError: error => sendMessage(`Virhe: ${error.message}`, 'danger')
  })

  const saveDetails = ({
    title,
    scienceClass,
    grades,
    remotePlatforms,
    otherRemotePlatformOption,
    desc,
    inPersonVisit,
    remoteVisit,
    extras,
    tags,
    startTime,
    endTime
  }) => {
    const gradeList = []
    grades.forEach((element, index) => element ? gradeList.push(index + 1) : null)

    const remotePlatformList = []
    remotePlatforms.forEach((element,index) => element ? remotePlatformList.push(index + 1) : null)

    const scienceClassList = []
    scienceClass.forEach((element, index) => element ? scienceClassList.push(index + 1) : null)

    create({
      variables: {
        event: event.id,
        title,
        scienceClass: scienceClassList,
        grades: gradeList,
        remotePlatforms: remotePlatformList,
        otherRemotePlatformOption,
        desc,
        inPersonVisit,
        remoteVisit,
        extras,
        tags,
        start: startTime.toISOString(),
        end: endTime.toISOString()
      }
    })
  }

  return (
    <Form
      event={event}
      close={close}
      save={saveDetails}
      validate={validate}
      tags={tags}
    />
  )
}