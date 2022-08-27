import { yupResolver } from '@hookform/resolvers/yup'
import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { userInit } from '../../helpers/initialvalues'
import { notifier } from '../../helpers/notifier'
import { CreateUserValidation, ModifyUserValidation } from '../../helpers/validate'
import { useUsers } from '../../hooks/cache'
import { Button, Radio, RadioGroup } from '../Embeds/Button'
import { Input } from '../Embeds/Input'
import { Error, required } from '../Embeds/Title'
import { Button as ChakraButton } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const RESOLVERS = { modify: ModifyUserValidation, create: CreateUserValidation }

const User = ({ close, type, initialValues }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { current: user, modify, add } = useUsers()
  const [modifyPassword, setModifyPassword] = useState(false)
  const [show, setShow] = useState(true)
  const { control, register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(RESOLVERS[type]),
    defaultValues: initialValues || userInit
  })

  const closeModal = () => {
    setShow(false)
    setTimeout(close, 300)
  }

  const isAdd = type === 'create'
  const handler = isAdd ? add : modify
  const onSubmit = async values => {
    const result = await handler({ user: values.id, ...values })
    notifier[isAdd ? 'createUser' : 'modifyUser'](result)
    if (result) closeModal()
  }

  const header = isAdd ? t('create-user-header') : t('modify-user-header')
  const submit = isAdd ? t('create-user') : t('modify-user')

  return (
    <Modal show={show} onHide={closeModal} backdrop='static' scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{header}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input id='username' title={required(t('username'))} {...register('username')}/>
          {errors.username && <Error>{t(errors.username.message)}</Error>}
          {!isAdd && <>
            {user.id !== watch('id') && (
              <RadioGroup name='isAdmin' title={t('user-role')} control={control} render={<>
                <Radio value='true'>{t('admin')}</Radio>
                <Radio value='false'>{t('employee')}</Radio>
              </>}/>
            )}
            {!modifyPassword && <ChakraButton
              style={{ marginTop: 15 }}
              onClick={() => setModifyPassword(true)}
            >{t('change-password')}</ChakraButton>}
          </>}
          {(isAdd || modifyPassword) && (
            <Input id='password' type='password' title={t('password')} {...register('password')} />
          )}
          {errors.password && <Error>{t(errors.password.message)}</Error>}
          {isAdd && <>
            <Input id='confirm' title={required(t('confirm'))} type='password' {...register('confirm')} />
            {errors.confirm && <Error>{t(errors.confirm.message)}</Error>}
            <RadioGroup name='isAdmin' title={required(t('user-role'))} control={control} render={<>
              <Radio value='true'>{t('admin')}</Radio>
              <Radio value='false'>{t('employee')}</Radio>
            </>} />
          </>}
        </form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{submit}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default User
