import { useMutation } from '@apollo/client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { CREATE_EVENT, TAGS } from '../../graphql/queries'
import { getPublishDate } from '../../helpers/form'
import Form from './Form'

export const EventForm = ({ sendMessage, addEvent, closeEventForm, newEventTimeRange, event, tags }) => {
  const { t } = useTranslation('event')
  const history = useHistory()

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

    if (values.waitingTime.length === 0 || values.waitingTime < 0) {
      errors.waitingTime = ' '
    }

    return errors
  }

  const [create] = useMutation(CREATE_EVENT, {
    refetchQueries: TAGS,
    onError: () => { sendMessage(t('event-creation-failed'), 'danger')},
    onCompleted: (data) => {
      data.createEvent.booked = false
      addEvent(data.createEvent)
      sendMessage(t('event-created'), 'success')
      history.push('/')
    }
  })

  const onSubmit = values => {
    const gradelist = []
    values.grades.forEach((element, index) => {
      if (element) {
        gradelist.push(index + 1)
      }
    })
    const scienceClassList = []
    values.scienceClass.forEach((element, index) => {
      if (element) {
        scienceClassList.push(index + 1)
      }
    })

    const remotePlatformList = []
    values.remotePlatforms.forEach((element,index) => {
      if(element){
        remotePlatformList.push(index + 1)
      }
    })

    create({
      variables: {
        grades: gradelist,
        remoteVisit: values.remoteVisit,
        inPersonVisit: values.inPersonVisit,
        title: values.title,
        start: values.startTime.toISOString(),
        end: values.endTime.toISOString(),
        remotePlatforms: remotePlatformList,
        otherRemotePlatformOption: values.otherRemotePlatformOption,
        scienceClass: scienceClassList,
        desc: values.desc,
        tags: values.tags,
        waitingTime: values.waitingTime,
        extras: values.extras,
        duration: values.duration,
        customForm: values.customForm,
        group: values.group ? values.group : null,
        publishDate: (values.publishDay && values.publishTime) ? getPublishDate(values.publishDay, values.publishTime) : null
      },
    })
  }

  return (
    <Form
      sendMessage={sendMessage}
      validate={validate}
      onSubmit={onSubmit}
      closeEventForm={closeEventForm}
      newEventTimeRange={newEventTimeRange}
      event={event}
      tags={tags}
    />
  )
}