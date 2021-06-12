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
    <div className="field is-grouped">
      <p className="control">
        <button className="button luma" onClick={createEvent}>Luo uusi vierailu</button>
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