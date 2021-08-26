import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

const UserPage = ({ currentUser, setShowEventForm }) => {
  const { t } = useTranslation('user')
  const history = useHistory()

  const createEvent = (event) => {
    event.preventDefault()
    setShowEventForm(true)
  }

  const listUsers = (event) => {
    event.preventDefault()
    history.push('/users')
  }

  const listVisits = (event) => {
    event.preventDefault()
    history.push('/visits')
  }

  const extras = (event) => {
    event.preventDefault()
    history.push('/extras')
  }

  const forms = (event) => {
    event.preventDefault()
    history.push('/forms')
  }

  const eventList = (event) => {
    event.preventDefault()
    history.push('/events')
  }

  const emailConfig = (event) => {
    event.preventDefault()
    history.push('/email-config')
  }

  const groups = (event) => {
    event.preventDefault()
    history.push('/group-list')
  }

  if (!currentUser) return <div></div>

  return (
    <div style={{ marginTop: 12 }}>
      <div className="field is-grouped">
        <div className="control">
          <button className="button luma" onClick={createEvent}>{t('create-visit')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={listVisits}>{t('reservations')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={extras}>{t('extras')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={forms}>{t('forms')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={groups}>{t('groups')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={eventList}>{t('event-list')}</button>
        </div>
      </div>
      <div className="field is-grouped">
        {currentUser.isAdmin &&
        <>
          <div className="control">
            <button className="button luma" onClick={listUsers}>{t('user-list')}</button>
          </div>
          <div className="control">
            <button className="button luma" onClick={emailConfig}>{t('email-config')}</button>
          </div>
        </>
        }
      </div>
    </div>
  )
}

export default UserPage