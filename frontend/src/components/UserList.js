import { useQuery } from '@apollo/client'
import React from 'react'
import { useHistory } from 'react-router'
import { USERS } from '../graphql/queries'

const UserList = () => {
  const result = useQuery(USERS)
  const history = useHistory()

  if (result.loading) return <></>

  const create = (event) => {
    event.preventDefault()
    history.push('/users/create')
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  return (
    <div>
      <h1 className="title">Users</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Account type</th>
          </tr>
        </thead>
        <tbody>
          {result.data.getUsers.map((user, index) =>
            <tr key={index}>
              <td>{user.username}</td>
              <td>{(user.isAdmin) ? 'admin' : 'default'}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="field is-grouped">
        <div className="control">
          <button className="button luma primary" onClick={create}>Luo uusi käyttäjä</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={cancel}>Poistu</button>
        </div>
      </div>
    </div>
  )
}

export default UserList