import { useMutation, useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { DELETE_USER, RESET_PASSWORD, USERS } from '../graphql/queries'
import { TextField } from './VisitForm/FormFields'

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
  const [resetPassword] = useMutation(RESET_PASSWORD, {
    refetchQueries: [{ query: USERS }],
    onCompleted: () => {
      sendMessage(t('password-changed'), 'success')
    },
    onError: (error) => {
      console.log(error)
      sendMessage(error.message, 'danger')
    }
  })

  const [user, setUser] = useState(null)

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

  const handlePasswordChange = (password) => {
    resetPassword({
      variables: {
        user: user.id,
        password
      }
    })
    setUser(null)
  }

  return (
    <>
      {user &&
        <div className={`modal ${user ? 'is-active':''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{
              user,
              password: '',
              confirm: '',
            }}
            onSubmit={(values) => handlePasswordChange(values.password)}
          >
            {({ handleSubmit }) => {
              return (
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">{user.username}</p>
                  </header>
                  <section className="modal-card-body">
                    <Field
                      label={t('password')}
                      fieldName='password'
                      type='password'
                      component={TextField}
                    />
                    <Field
                      label={t('confirm-password')}
                      fieldName='confirm'
                      type='password'
                      component={TextField}
                    />
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit}>{t('change-password')}</button>
                    <button className="button" onClick={() => setUser(null)}>{t('close')}</button>
                  </footer>
                </div>
              )}}
          </Formik>
        </div>
      }
      <div className="section">
        <h1 className="title">{t('users')}</h1>
        <table className="table">
          <thead>
            <tr>
              <th>{t('username')}</th>
              <th>{t('priviledges')}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.data.getUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.isAdmin ? t('admin') : t('basic')}</td>
                <td>{user.id !== currentUser.id &&
                <button className='button luma' onClick={() => handleRemove(user.id)}>Poista</button>}
                </td>
                <td>
                  <button className='button luma' onClick={() => setUser(user)}>Vaihda salasana</button>
                </td>
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
    </>
  )
}

export default UserList