import React, { useState, useEffect } from 'react'
import { FIND_VISIT, CANCEL_VISIT, EVENTS } from '../graphql/queries'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router'
import { format, parseISO }  from 'date-fns'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import { classes } from '../helpers/classes'

const filterEventClass = (eventClasses) => {
  const classesArray = eventClasses.map(c => classes[c-1].label)
  return classesArray.join(', ')
}

const VisitPage = ({ sendMessage }) => {
  const { t } = useTranslation(['event', 'visit'])
  const history = useHistory()

  const id = useParams().id
  const [visit, setVisit] = useState(null)

  const [findVisit, { loading, data }] = useLazyQuery(FIND_VISIT, {
    onError: (error) => console.log('virheviesti: ', error),
  })

  const [cancelVisit, resultOfCancel] = useMutation(CANCEL_VISIT, {
    refetchQueries: [{ query: EVENTS }],
    onError: (e) => {
      sendMessage(t('error'), 'danger')
      console.log(e)
    },
    //fetchPolicy: 'cache-and-network'
  })

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  useEffect(() => {
    if (!data) {
      findVisit({ variables: { id } })
    }
    else if (data.findVisit) {
      let parsedVisit = { ...data.findVisit }
      if (typeof parsedVisit.startTime === 'string') {
        parsedVisit.startTime=parseISO(data.findVisit.startTime)
        parsedVisit.endTime=parseISO(data.findVisit.endTime)
      }
      parsedVisit.customFormData = JSON.parse(parsedVisit.customFormData)
      setVisit(parsedVisit)
    }
  }, [data])

  useEffect(() => {
    if (resultOfCancel.data) {
      sendMessage(t('visit-cancelled'), 'success')
      history.push('/')
    }
  }, [resultOfCancel.data])

  if (loading) {
    return (
      <div>
        <p>{t('searching-visit')}</p>
      </div>
    )
  }
  if (!visit || visit.status === false) {
    return (
      <div>
        <p>{t('visit:not-found')}</p>
      </div>
    )
  }

  const handleCancel = (event) => {
    event.preventDefault()
    confirm(t('cancel-confirm')) && cancelVisit({
      variables: { id }
    })
  }

  return (
    <div className="container">
      <div className="columns is-centered">
        <div className="section">
          <div className="title">{t('reservation-text')}:</div>
          <div className="box">
            <div className="content luma">
              <p className="title">{visit.event.title}</p>
              <p><strong>{t('description')}:</strong> {visit.event.desc}</p>
              <p><strong>{t('science-class')}:</strong> {filterEventClass(visit.event.resourceids)}</p>
              {visit.extras.length
                ? <p><strong>{t('extras')}:</strong> {visit.extras.map(extra => <span key={extra.name}>{extra.name}</span>) }</p>
                : null}
              <p><strong>{t('teaching')}:</strong>
                {visit.inPersonVisit ? ` ${t('inperson')}` : <></>}
                {visit.remoteVisit ? ` ${t('remote')}` : <></>}
              </p>
              <p><strong>{t('event-date')}:</strong> {format(visit.startTime, 'd.M.yyyy')}</p>
              <p><strong>{t('event-start')}:</strong> {format(visit.startTime, 'HH:mm')}</p>
              <p><strong>{t('event-end')}:</strong> {format(visit.endTime, 'HH:mm')}</p>
              <hr></hr>
              <p className='subtitle'><b>{t('given-info')}:</b></p>
              <p><strong>{t('visit:client-name')}:</strong> {visit.clientName}</p>
              <p><strong>{t('visit:client-email')}:</strong> {visit.clientEmail}</p>
              <p><strong>{t('visit:client-phone')}</strong> {visit.clientPhone}</p>
              <p><strong>{t('school-name')}:</strong> {visit.schoolName}</p>
              <p><strong>{t('school-location')}:</strong> {visit.schoolLocation}</p>
              <p><strong>{t('selected-grade')}:</strong> {visit.grade}</p>
              <p><strong>{t('participants')}:</strong> {visit.participants}</p>

              {visit.remoteVisit &&
              <p><strong>{t('selected-remote-platform')}:</strong> {visit.remotePlatform}</p>
              }

              {!!visit.customFormData &&
                visit.customFormData.map((f,index) =>
                  <p key={index}><strong>{f.name}:</strong> {f.value}</p>
                )
              }
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button className="button is-danger luma" onClick={handleCancel}>{t('cancel')}</button>
              </div>
              <div className="control">
                <button className="button luma" onClick={cancel}>{t('to-calendar')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitPage