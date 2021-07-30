import { useMutation } from '@apollo/client'
import { format } from 'date-fns'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { EVENTS, FORCE_DELETE_EVENTS } from '../graphql/queries'
import { TextField } from './VisitForm/FormFields'

const EventList = ({ events }) => {
  const { t } = useTranslation('event')
  const history = useHistory()
  const [modalState, setModalState] = useState(null)
  const [checkedEvents, setCheckedEvents] = useState([])
  const [forceDeleteEvents] = useMutation(FORCE_DELETE_EVENTS, {
    refetchQueries: EVENTS,
    onError: (error) => console.log(error),
    onCompleted: () => setModalState(null)
  })

  const sortableEvents = events.map(event => {
    return (
      <tr key={event.id}>
        <td>
          <input type="checkbox" onClick={(e) => handleCheckEvent(e, event.id)} />
        </td>
        <td>{event.title}</td>
        <td>{`${format(new Date(event.start), 'dd:MM:yyyy')}`}</td>
        <td>{`${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}</td>
      </tr>
    )
  })

  const handleCheckEvent = (event, id) => {
    if (event.target.checked) {
      setCheckedEvents(checkedEvents.concat(id))
    } else {
      setCheckedEvents(checkedEvents.filter(e => e !== id))
    }
  }

  const handleBack = () => {
    history.push('/')
  }

  const openDeleteModal = () => {
    setModalState('delete')
  }

  const handleDeleteEvents = (values) => {
    forceDeleteEvents({
      variables: {
        events: checkedEvents,
        password: values.password
      }
    })
  }

  return (
    <>
      {modalState === 'delete' &&
        <div className={`modal ${modalState ? 'is-active': ''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{ password: '' }}
            onSubmit={handleDeleteEvents}
          >
            {({ handleSubmit }) => {
              return (
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">{t('delete-events-confirm')}</p>
                  </header>
                  <section className="modal-card-body">

                    <Field
                      label={t('password')}
                      fieldName='password'
                      type='password'
                      component={TextField}
                    />
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit} type='submit'>{t('delete-events')}</button>
                    <button className="button" onClick={() => setModalState(null)}>{t('close')}</button>
                  </footer>
                </div>
              )}}
          </Formik>
        </div>
      }
      <div className="section">
        <h1 className="title">{t('events')}</h1>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>{t('event')}</th>
              <th>{t('date')}</th>
              <th>{t('time')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortableEvents}
          </tbody>
        </table>
        <div className="field is-grouped">
          <div className="control">
            <button className="button luma primary" onClick={openDeleteModal} >{t('delete-choosen-events')}</button>
          </div>
          <div className="control">
            <button className="button luma" onClick={handleBack} >{t('back')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EventList