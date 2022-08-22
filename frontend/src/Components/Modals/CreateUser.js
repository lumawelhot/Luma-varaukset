/* eslint-disable no-unreachable */
import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../Embeds/Button'
import { Radio } from '@chakra-ui/react'
import { Error } from '../Embeds/Title'
import { CreateUserValidation } from '../../helpers/validate'
import { userInit } from '../../helpers/initialvalues'
import { useForm } from 'react-hook-form'
import { required } from '../Embeds/Title'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '../Embeds/Input'
import { RadioGroup } from '../Embeds/Button'
import { useUsers } from '../../hooks/cache'
import { notifier } from '../../helpers/notifier'

const CreateUser = ({ show, close }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { add } = useUsers()
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(CreateUserValidation),
    defaultValues: userInit,
    mode: 'onTouched'
  })

  const onSubmit = async values => {
    const result = await add(values)
    notifier.createUser(result)
    if (result) close()
    reset(userInit)
  }

  return (
    <Modal show={show} onHide={close} backdrop='static' scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('create-user-header')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input id='username' title={required(t('username'))} {...register('username')} />
          {errors.username && <Error>{t(errors.username.message)}</Error>}
          <Input id='password' title={required(t('password'))} type='password' {...register('password')} />
          {errors.password && <Error>{t(errors.password.message)}</Error>}
          <Input id='confirm' title={required(t('confirm'))} type='password' {...register('confirm')} />
          {errors.confirm && <Error>{t(errors.confirm.message)}</Error>}
          <RadioGroup name='isAdmin' title={required(t('user-role'))} control={control} render={<>
            <Radio value='true'>{t('admin')}</Radio>
            <Radio value='false'>{t('employee')}</Radio>
          </>} />
        </form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{t('create-user')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CreateUser
