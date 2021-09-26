import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ASSIGN_PUBLISH_DATE_TO_EVENTS, EVENTS, GET_GROUPS } from '../../graphql/queries'
import { getPublishDate } from '../../helpers/form'
import DatePicker from '../Pickers/DatePicker'
import TimePicker from '../Pickers/TimePicker'

const PublishModal = ({ setModalState, checkedEvents, events }) => {
  const { t } = useTranslation('event')
  const [publishDay, setPublishDay] = useState(null)
  const [publishTime, setPublishTime] = useState(null)
  const [assignPublishDateToEvents] = useMutation(ASSIGN_PUBLISH_DATE_TO_EVENTS, {
    refetchQueries: [{ query: EVENTS }, { query: GET_GROUPS }],
    onError: (error) => console.log(error),
    onCompleted: () => handleModalClose()
  })


  const assignPublishDate = () => {
    assignPublishDateToEvents({
      variables: {
        publishDate: getPublishDate(publishDay, publishTime),
        events: checkedEvents
      }
    })
  }

  const handleModalClose = () => {
    setModalState(null)
    setPublishDay(null)
    setPublishTime(null)
  }

  return (
    <div className="modal-card">
      <header className="modal-card-head">
        <p className="modal-card-title">{t('assign-publish-date')}</p>
      </header>
      <section className="modal-card-body">
        <div className="label">{t('events')}:</div>
        <ul>
          {events.filter(event => checkedEvents.includes(event.id)).map(event =>
            <li key={event.id}>{event.title}</li>
          )}
        </ul>
        <label className="label">{t('publish-date')}</label>
        <DatePicker
          format={'d.M.yyyy'}
          value={publishDay}
          placeholder={t('publish-date')}
          style={{ width: 150, marginRight: 10 }}
          onChange={value => setPublishDay(value)}
        />
        <TimePicker
          value={publishTime}
          placeholder={t('publish-time')}
          style={{ width: 150, marginRight: 10 }}
          onChange={value => setPublishTime(value)}
          disabledHours={() => []}
        />
      </section>
      <footer className="modal-card-foot">
        <button className="button luma" type='submit' onClick={assignPublishDate}>{t('assign-to-events')}</button>
        <button className="button" onClick={handleModalClose}>{t('close')}</button>
      </footer>
    </div>
  )
}

export default PublishModal