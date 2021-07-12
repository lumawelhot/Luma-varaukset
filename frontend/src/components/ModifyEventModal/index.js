import { useMutation } from '@apollo/client'
import React from 'react'
import { EVENTS, UPDATE_EVENT } from '../../graphql/queries'
import Form from './Form'

export const ModifyEvent = ({ event, close, setEvent }) => {

  const [create] = useMutation(UPDATE_EVENT, {
    refetchQueries: [{ query: EVENTS }],
    onCompleted: result => {
      setEvent({
        ...event,
        ...result.modifyEvent
      })
      close()
    },
    onError: error => console.log(error)
  })

  const saveDetails = ({ title, scienceClass, grades, remotePlatforms, otherRemotePlatformOption, desc, inPersonVisit, remoteVisit, extras, tags }, { data }) => {
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
      }
    })
  }

  return (
    <Form event={event} close={close} save={saveDetails} />
  )
}