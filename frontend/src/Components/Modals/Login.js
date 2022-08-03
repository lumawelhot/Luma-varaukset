import React from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../Embeds/Button'
import { Formik } from 'formik'
import { Input } from '../Embeds/Input'
import { useEvict, useUser } from '../../hooks/api'
import { error } from '../../helpers/toasts'

const Login = ({ show, close }) => {
  const { t } = useTranslation()
  const { login, fetch } = useUser()
  const { evict } = useEvict()

  const submit = async (values, formik) => {
    const { username, password } = values
    const token = await login({ username, password })
    if (token) {
      localStorage.setItem('app-token', token)
      fetch()
      evict()
      close()
    } else error(t('notify-login-failed'))
    formik.setFieldValue('username', '')
    formik.setFieldValue('password', '')
  }

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
      }}
      onSubmit={submit}
    >
      {({ handleChange, handleSubmit, values }) => (
        <Modal
          show={show}
          onHide={close}
          backdrop="static"
        >
          <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
            <Modal.Title>{t('login-header')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input
              id='username'
              title={t('username')}
              onChange={handleChange}
              value={values.username}
            />
            <Input
              id='password'
              title={t('password')}
              type='password'
              onChange={handleChange}
              value={values.password}
            />
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
            <Button
              className='active'
              onClick={handleSubmit}
              type='submit'
            >
              {t('login')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Formik>
  )
}

export default Login
