import { useMutation, useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { CHANGE_USERNAME, DELETE_USER, RESET_PASSWORD, USERS } from '../graphql/queries'
import { RadioButton, TextField } from './VisitForm/FormFields'

const UserList = ({ sendMessage, currentUser }) => {
  const { t } = useTranslation('user')
  const users = useQuery(USERS)
  const [modalState, setModalState] = useState(null)
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

  const validatePassword = (values) => {
    const errors = {}
    if (values.password.length < 8) {
      errors.length = t('password-atleast-eight')
    }
    if (values.password !== values.confirm) {
      errors.confirm = t('passwords-do-not-match')
    }
    return errors
  }

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
  const [changeUsername] = useMutation(CHANGE_USERNAME, {
    refetchQueries: [{ query: USERS }],
    onCompleted: () => {
      sendMessage(t('username-changed'), 'success')
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
    if (confirm(t('remove-confirm'))) {
      deleteUser({
        variables: {
          id
        }
      })
    }
  }

  const handlePasswordChange = (password) => {
    resetPassword({
      variables: {
        user: user.id,
        password
      }
    })
    setModalState(null)
    setUser(null)
  }

  const handleUsernameChange = (username, isAdmin) => {
    changeUsername({
      variables: {
        user: user.id,
        username,
        isAdmin
      }
    })
    setModalState(null)
    setUser(null)
  }

  return (
    <>
      {user && modalState === 'password' &&
        <div className={`modal ${user ? 'is-active':''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{
              user,
              password: '',
              confirm: '',
            }}
            validate={validatePassword}
            onSubmit={(values) => handlePasswordChange(values.password)}
          >
            {({ handleSubmit, errors, touched }) => {
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
                    {errors.confirm && touched.password && touched.confirm ?
                      <p className="help is-danger">{errors.password}</p> : null
                    }
                    {errors.length && touched.password ?
                      <p className="help is-danger">{errors.length}</p> : null
                    }
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit} type='submit'>{t('change-password')}</button>
                    <button className="button" onClick={() => setUser(null)}>{t('close')}</button>
                  </footer>
                </div>
              )}}
          </Formik>
        </div>
      }
      {user && modalState === 'username' &&
        <div className={`modal ${user ? 'is-active':''}`}>
          <div className="modal-background"></div>
          <Formik
            initialValues={{
              user,
              username: user.username,
              isAdmin: user.isAdmin
            }}
            onSubmit={(values) => handleUsernameChange(values.username, values.isAdmin)}
          >
            {({ handleSubmit, values, setFieldValue }) => {
              return (
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">{values.username} - {values.isAdmin ? t('administrator') : t('employee')}</p>
                  </header>
                  <section className="modal-card-body">
                    <Field
                      label={t('username')}
                      fieldName='username'
                      component={TextField}
                    />
                    {currentUser.username !== user.username &&
                    <>
                      <label className="label">{t('user-role')}</label>
                      <Field
                        checked={values.isAdmin}
                        label={t('administrator')}
                        id='permission'
                        onChange={() => setFieldValue('isAdmin', true)}
                        component={RadioButton}
                      />
                      <Field
                        checked={!values.isAdmin}
                        style={{ marginBottom: 10 }}
                        label={t('employee')}
                        id='permission'
                        onChange={() => setFieldValue('isAdmin', false)}
                        component={RadioButton}
                      />
                    </>
                    }
                  </section>
                  <footer className="modal-card-foot">
                    <button className="button luma" onClick={handleSubmit} type='submit'>{t('change-username')}</button>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.data.getUsers.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.isAdmin ? t('admin') : t('basic')}</td>
                <td>{user.id !== currentUser.id &&
                <button className='button luma' onClick={() => handleRemove(user.id)}>{t('delete')}</button>}
                </td>
                <td>
                  <button className='button luma' onClick={() => {
                    setUser(user)
                    setModalState('password')
                  }}>{t('change-password')}</button>
                </td>
                <td>
                  <button className='button luma' onClick={() => {
                    setUser(user)
                    setModalState('username')
                  }}>{t('change-username')}</button>
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