import { useMutation } from '@apollo/client'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { CREATE_EVENT } from '../../graphql/queries'
import Form from './Form'

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

  if (values.waitingTime.length === 0 || values.waitingTime < 0) {
    errors.waitingTime = ' '
  }

  return errors
}



export const EventForm = ({ sendMessage, addEvent, closeEventForm, newEventTimeRange }) => {
  const history = useHistory()

  const [create] = useMutation(CREATE_EVENT, {
    onError: () => { sendMessage('Vierailun luonti epäonnistui! Tarkista tiedot!', 'danger')},
    onCompleted: (data) => {
      data.createEvent.booked = false
      addEvent(data.createEvent)
      sendMessage('Vierailu luotu.', 'success')
      history.push('/')
    }
  })

  const onSubmit = (values, tags) => {
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
        tags: values.tags.map((tag) =>
          Object({
            id: tags.data.getTags.find((t) => t.name === tag)?.id || null,
            name: tag,
          })
        ),
        waitingTime: values.waitingTime,
        extras: values.extras,
        duration: values.duration
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
    />
  )
}