import { useMutation } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EVENTS, FORCE_DELETE_EVENTS } from '../../graphql/queries'
import { TextField } from '../VisitForm/FormFields'

const Form = ({ sendMessage, setModalState, checkedEvents, events }) => {
  const { t } = useTranslation('event')
  const [showEvents, setShowEvents] = useState(false)

  const [forceDeleteEvents] = useMutation(FORCE_DELETE_EVENTS, {
    refetchQueries: [{ query: EVENTS }],
    onError: () => sendMessage(t('failed-to-remove-events'), 'danger'),
    onCompleted: () => {
      setModalState(null)
      sendMessage(t('events-removed-successfully'), 'success')
    }
  })

  const handleDeleteEvents = (values) => {
    forceDeleteEvents({
      variables: {
        events: checkedEvents,
        password: values.password
      }
    })
    values.password = ''
  }

  return (
    <Formik
      initialValues={{
        password: ''
      }}
      onSubmit={handleDeleteEvents}
    >
      {({ handleSubmit }) => {
        return (
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{t('delete-events-confirm')}</p>
            </header>
            <section className="modal-card-body">
              <div className="label" style={{ color: 'red' }}>{t('event-deletion-alert-text')}</div>
              {checkedEvents.length ?
                <>
                  <Field
                    label={t('confirm-with-password')}
                    fieldName='password'
                    type='password'
                    component={TextField}
                  />
                  {showEvents &&
                    <>
                      <div className="label">{t('events')}:</div>
                      <ul>
                        {events.filter(event => checkedEvents.includes(event.id)).map(event =>
                          <li key={event.id}>{event.title}</li>
                        )}
                      </ul>
                      <a onClick={() => setShowEvents(false)}>{t('hide-events-to-be-removed')}</a>
                    </>
                  }
                  {!showEvents &&
                    <a onClick={() => setShowEvents(true)}>{t('show-events-to-be-removed')}</a>
                  }
                </>
                :
                <div className="label">{t('no-events-chosen')}</div>
              }
            </section>
            <footer className="modal-card-foot">
              <button className="button luma" onClick={handleSubmit} type='submit'>{t('delete-events')}</button>
              <button className="button" onClick={() => setModalState(null)}>{t('close')}</button>
            </footer>
          </div>
        )}}
    </Formik>
  )
}

export default Form