/* eslint-disable no-unused-vars */
import React, { useId } from 'react'
import { Button } from '../Embeds/Button'
import { Modal, ModalHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { GroupValidation } from '../../helpers/validate'
import { Error, required } from '../Embeds/Title'
import { Input } from '../Embeds/Input'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

const Group = ({ show, close, handle, title, initialValues }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(GroupValidation),
    defaultValues: initialValues
  })

  const onSubmit = async values => {
    if(await handle(values)) close()
  }

  return (
    <Modal
      show={show}
      backdrop="static"
      onHide={close}
      scrollable={true}
    >
      <ModalHeader style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </ModalHeader>
      <Modal.Body>
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <Input id='name' title={required(t('group-name'))} {...register('name')} />
          {errors.name && <Error>{t(errors.name.message)}</Error>}
          <Input id='maxCount' title={required(t('group-maxcount'))} type='number' {...register('maxCount')} />
          {errors.maxCount && <Error>{t(errors.maxCount.message)}</Error>}
        </form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{title}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Group