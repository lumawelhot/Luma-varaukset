import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import React from 'react'
import { EVENTS, UPDATE_EVENT } from '../../graphql/queries'
import Form from './Form'

export const ModifyEvent = ({ event, close, setEvent, sendMessage }) => {
  const validate = (values) => {
    const defErrorMessage = 'Täytä tämä kenttä.'
    const errors = {}

    if (!values.title) {
      errors.title = defErrorMessage
    }

    if (!values.grades.includes(true)) {
      errors.gradesError = 'Valitse vähintään yksi luokka-aste.'
    }

    if (!values.scienceClass.includes(true)) {
      errors.scienceClassError = 'Valitse vähintään yksi tiedeluokka.'
    }

    if(!values.remotePlatforms.includes(true) && values.remoteVisit){
      errors.remoteError = 'Valitse vähintään yksi etäyhteysalusta.'
    }
    if(!values.otherRemotePlatformOption && values.remotePlatforms[3] && values.remoteVisit){
      errors.otherRemotePlatformOption = 'Kirjoita muun etäyhteysalustan nimi.'
    }

    if (!(values.remoteVisit || values.inPersonVisit)) {
      errors.location = 'Valitse joko etä- tai lähivierailu.'
    }

    if (!values.startTime) {
      errors.startTime = defErrorMessage
    } else if (values.startTime.getHours() < 8 || values.startTime.getHours() > 16) {
      errors.startTime = 'Aloitusajan pitää olla klo 08:00 ja 16:00 välillä.'
    }

    if (!values.endTime) {
      errors.endTime = defErrorMessage
    } else if (values.startTime > values.endTime) {
      errors.endTime = 'Lopetusajan pitää olla aloitusajan jälkeen.'
    } else if (values.endTime.getHours() > 16 && values.endTime.getMinutes() !== 0) {
      errors.endTime = 'Lopetusaika saa olla korkeintaan 17.00.'
    }

    if (values.startTime.getTime() > event.invalidTimeSlot.start.getTime()) {
      errors.startTime = `Aloitusajan tulee olla ennen klo ${format(event.invalidTimeSlot.start, 'HH.mm')}`
    }
    if (values.endTime.getTime() < event.invalidTimeSlot.end.getTime()) {
      errors.endTime = `Lopetusaika tulee olla klo ${format(event.invalidTimeSlot.end, 'HH.mm')} jälkeen`
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
  }, { data }) => {
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
        tags: tags.map((tag) =>
          Object({
            id: data.getTags.find((t) => t.name === tag)?.id || null,
            name: tag,
          })
        ),
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
    />
  )
}