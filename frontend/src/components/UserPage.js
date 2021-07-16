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

  if (!currentUser) return <div></div>

  return (
    <div className="field is-grouped">
      <p className="control">
        <button className="button luma" onClick={createEvent}>{t('create-visit')}</button>
      </p>
      <p className="control">
        <button className="button luma" onClick={listVisits}>{t('reservations')}</button>
      </p>
      <p className="control">
        <button className="button luma" onClick={extras}>{t('extras')}</button>
      </p>
      {currentUser.isAdmin &&
        <p className="control">
          <button className="button luma" onClick={listUsers}>{t('user-list')}</button>
        </p>
      }
    </div>
  )
}

export default UserPage