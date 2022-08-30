import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../Embeds/Button'
import { useForm } from 'react-hook-form'
import { Input } from '../Embeds/Input'
import { useUsers, useEvict } from '../../hooks/cache'
import { notifier } from '../../helpers/notifier'
import { useCloseModal } from '../../hooks/utils'
import PropTypes from 'prop-types'

const Login = ({ close }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { login } = useUsers()
  const { evict } = useEvict()
  const { register, handleSubmit, reset } = useForm()
  const [show, closeModal] = useCloseModal(close)

  const onSubmit = async values => {
    const success = await login(values)
    notifier.login(success)
    if (success) {
      evict()
      closeModal()
    }
    reset({ username: '', password: '' })
  }

  return (

    <Modal show={show} onHide={closeModal} backdrop='static'>
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

Login.propTypes = {
  close: PropTypes.func.isRequired
}
