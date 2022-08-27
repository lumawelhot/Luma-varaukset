import { Button as ChakraButton } from '@chakra-ui/react'
import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio, RadioGroup } from '../Embeds/Button'
import { Error, required } from '../Embeds/Title'
import { ModifyUserValidation } from '../../helpers/validate'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '../Embeds/Input'
import { useUsers } from '../../hooks/cache'
import { notifier } from '../../helpers/notifier'

const ModifyUser = ({ show, close, initialValues }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { current: user, modify } = useUsers()
  const [modifyPassword, setModifyPassword] = useState(false)
  const { control, register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(ModifyUserValidation),
    defaultValues: initialValues
  })

  const onSubmit = async values => {
    const result = await modify({ ...values, user: values.id })
    notifier.modifyUser(result)
    if (result) close()
  }

  return (
    <Modal show={show} onHide={close} backdrop='static' scrollable={true} >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('modify-user-header')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input id='username' title={required(t('username'))} {...register('username')}/>
          {errors.username && <Error>{t(errors.username.message)}</Error>}
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
          {modifyPassword && (
            <Input id='password' type='password' title={t('password')} {...register('password')} />
          )}
          {errors.password && <Error>{t(errors.password.message)}</Error>}
        </form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{t('modify-user')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModifyUser
