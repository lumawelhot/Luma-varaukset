import React from 'react'
import { useHistory } from 'react-router'

const UserPage = ({ currentUser, setShowEventForm }) => {
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
        <button className="button luma" onClick={createEvent}>Luo uusi vierailu</button>
      </p>
      <p className="control">
        <button className="button luma" onClick={listVisits}>Varaukset</button>
      </p>
      <p className="control">
        <button className="button luma" onClick={extras}>Lisäpalvelut</button>
      </p>
      {currentUser.isAdmin &&
        <p className="control">
          <button className="button luma" onClick={listUsers}>Käyttäjälista</button>
        </p>
      }
    </div>
  )
}

export default UserPage