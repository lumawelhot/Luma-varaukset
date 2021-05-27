import { useQuery } from '@apollo/client'
import React from 'react'
import { USERS } from '../graphql/queries'

const ListUsers = () => {
  const result = useQuery(USERS)

  if (result.loading) {
    return <>loading...</>
  }

  console.log(result.data.getUsers)

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
    </div>
  )
}

export default ListUsers