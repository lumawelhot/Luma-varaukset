import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../Embeds/Button'
import { useForm } from 'react-hook-form'
import { useEvict, useUser } from '../../hooks/api'
import { error } from '../../helpers/toasts'
import { Input } from '../Embeds/Input'

const Login = ({ show, close }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { login, fetch } = useUser()
  const { evict } = useEvict()
  const { register, handleSubmit, reset } = useForm()
  const onSubmit = async values => {
    const token = await login(values)
    if (token) {
      localStorage.setItem('app-token', token)
      fetch()
      evict()
      close()
    } else error(t('notify-login-failed'))
    reset({ username: '', password: '' })
  }

  return (

    <Modal show={show} onHide={close} backdrop='static'>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('login-header')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input title={t('username')} id='username' {...register('username')} />
          <Input id='password' type='password' title={t('password')} {...register('password')} />
        </form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{t('login')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Login
