import { useMutation } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { LOGIN } from '../graphql/queries'
import { TextField } from './VisitForm/FormFields'

const LoginForm = ({ getUser, sendMessage }) => {
  const { t } = useTranslation('user')
  const history = useHistory()
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => sendMessage(error.graphQLErrors[0].message, 'danger')
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      localStorage.setItem('app-token', token)
      getUser()
      history.push('/')
    }
  }, [result.data])

  const submit = (values) => {
    login({
      variables: {
        username: values.username,
        password: values.password,
      },
    })
    values.username = ''
    values.password = ''
  }

  const cancel = (event) => {
    event.preventDefault()
    history.push('/')
  }

  return (
    <Formik
      initialValues={{
        username: '',
        password: ''
      }}
      onSubmit={submit}
    >
      {({ handleSubmit }) => {
        return (
          <div className="container">
            <div className="columns is-centered">
              <div className="section">
                <div className="title">{t('login-luma')}</div>
                <form onSubmit={handleSubmit}>
                  <Field
                    label={t('username')}
                    component={TextField}
                    fieldName='username'
                  />
                  <Field
                    style={{ width: 500 }}
                    label={t('password')}
                    type='password'
                    component={TextField}
                    fieldName='password'
                  />
                  <div className="field is-grouped">
                    <div className="control">
                      <button id="login" className="button luma primary" type="submit">
                        {t('login')}
                      </button>
                    </div>
                    <div className="control">
                      <button className="button luma" onClick={cancel}>
                        {t('back')}
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

export default LoginForm
