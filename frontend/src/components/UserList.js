import { useMutation, useQuery } from '@apollo/client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { DELETE_USER, USERS } from '../graphql/queries'

const UserList = ({ sendMessage, currentUser }) => {
  const { t } = useTranslation('user')
  const users = useQuery(USERS)
  const history = useHistory()
  const [deleteUser,] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: USERS }],
    onCompleted: () => {
      sendMessage(t('user-removed'), 'success')
    },
    onError: (error) => {
      sendMessage(error.message, 'danger')
    }
  })

  if (users.loading) return <></>

  const create = (event) => {
    event.preventDefault()
    history.push('/users/create')
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const handleRemove = (id) => {
    deleteUser({
      variables: {
        id
      }
    })
  }

  return (
    <div className="section">
      <h1 className="title">{t('users')}</h1>
      <table className="table">
        <thead>
          <tr>
            <th>{t('username')}</th>
            <th>{t('priviledges')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.data.getUsers.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.isAdmin ? t('admin') : t('basic')}</td>
              <td>{user.id !== currentUser.id && <button className='button luma' onClick={() => handleRemove(user.id)}>Poista</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="field is-grouped">
        <div className="control">
          <button className="button luma primary" onClick={create}>{t('create-user')}</button>
        </div>
        <div className="control">
          <button className="button luma" onClick={cancel}>{t('back')}</button>
        </div>
      </div>
    </div>
  )
}

export default UserList