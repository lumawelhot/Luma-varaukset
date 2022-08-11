import { RadioGroup, Button as ChakraButton } from '@chakra-ui/react'
import React, { useId, useState } from 'react'
import { Modal, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio } from '../Embeds/Button'
import Title, { Error, required } from '../Embeds/Title'
import { ModifyUserValidation } from '../../helpers/validate'
import { error, success } from '../../helpers/toasts'
import { useUser } from '../../hooks/api'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '../Embeds/Input'

const ModifyUser = ({ show, close, initialValues }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { current: user, modify } = useUser()
  const [modifyPassword, setModifyPassword] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(ModifyUserValidation),
    defaultValues: initialValues
  })

  const onSubmit = async values => {
    if (await modify({ ...values, user: values.id })) {
      success(t('notify-user-modify-success'))
      close()
    } else error(t('notify-user-modify-error'))
  }

  return (
    <Modal show={show} onHide={close} backdrop="static" scrollable={true} >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('modify-user-header')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input id='username' title={required(t('username'))} {...register('username')}/>
          {errors.username && <Error>{t(errors.username.message)}</Error>}
          {user.id !== watch('id') && <>
            <Title>{t('user-role')}</Title>
            <RadioGroup onChange={v => setValue('isAdmin', v)} value={watch('isAdmin')}>
              <Stack direction='col'>
                <Radio value='true'>{t('admin')}</Radio>
                <Radio value='false'>{t('employee')}</Radio>
              </Stack>
            </RadioGroup>
          </>}
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