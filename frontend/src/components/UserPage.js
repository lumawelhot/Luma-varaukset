import React from 'react'
import { useHistory } from 'react-router'

const UserPage = ({ currentUser }) => {
  const history = useHistory()

  const createEvent = (event) => {
    event.preventDefault()
    history.push('/event')
  }

  const listUsers = (event) => {
    event.preventDefault()
    history.push('/users')
  }

  if (!currentUser) return <div></div>

  return (
    <div>
      <button className="button is-link is-light" onClick={createEvent}>Luo uusi vierailu</button>
      {currentUser.isAdmin &&
        <button className="button is-link is-light" onClick={listUsers}>Käyttäjälista</button>
      }
    </div>
  )
}

export default UserPage