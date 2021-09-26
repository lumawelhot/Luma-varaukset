import { useMutation } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { CREATE_USER, USERS } from '../graphql/queries'
import { RadioButton, TextField } from './VisitForm/FormFields'

const UserForm = ({ sendMessage }) => {
  const { t } = useTranslation('user')
  const history = useHistory()

  const [createUser, result] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: USERS }],
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  useEffect(() => {
    if (result.data) {
      sendMessage(`${t('username')} '${result.data.createUser.username}' ${t('created')}.`, 'success')
      history.push('/')
    }
  }, [result])

  const onSubmit = (values) => {
    createUser({
      variables: {
        username: values.username,
        password: values.password,
        isAdmin: values.isAdmin
      }
    }).catch(() => sendMessage(t('invalid-input'), 'danger'))
    values.username = ''
    values.password = ''
  }

  const cancel = (event) => {
    event.preventDefault()

    history.push('/')
  }

  const validate = (values) => {
    const errors = {}
    if (values.password.length < 8) {
      errors.password = t('password-atleast-eight')
    }
    if (values.username.length < 5) {
      errors.username = t('username-atleast-five')
    }

    return errors
  }

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
        isAdmin: null,
      }}
      onSubmit={onSubmit}
      validate={validate}
    >
      {({ handleSubmit, setFieldValue }) => {
        return (
          <div className="container">
            <div className="columns is-centered">
              <div className="section">
                <div className="title">{t('create-user')}</div>
                <form onSubmit={handleSubmit} >
                  <Field
                    style={{ width: 500 }}
                    label={t('username')}
                    fieldName='username'
                    component={TextField}
                  />
                  <Field
                    label={t('password')}
                    fieldName='password'
                    type='password'
                    component={TextField}
                  />
                  <label className="label">{t('user-role')}</label>
                  <Field
                    label={t('administrator')}
                    id='permission'
                    onChange={() => setFieldValue('isAdmin', true)}
                    component={RadioButton}
                  />
                  <Field
                    style={{ marginBottom: 10 }}
                    label={t('employee')}
                    id='permission'
                    onChange={() => setFieldValue('isAdmin', false)}
                    component={RadioButton}
                  />
                  <div className="field is-grouped">
                    <div className="control">
                      <button
                        id="create"
                        className="button luma primary"
                        type='submit'
                      > {t('save-user')}
                      </button>
                    </div>
                    <div className="control">
                      <button
                        className="button luma"
                        onClick={cancel}
                      > {t('back')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

export default UserForm