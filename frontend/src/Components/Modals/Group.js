import React, { useId, useState } from 'react'
import { Button } from '../Embeds/Button'
import { Modal, ModalHeader } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { GroupValidation } from '../../helpers/validate'
import { Error, required } from '../Embeds/Title'
import { Input } from '../Embeds/Input'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useGroups } from '../../hooks/cache'
import { notifier } from '../../helpers/notifier'

const Group = ({ close, initialValues, type }) => {
  const { t } = useTranslation()
  const formId = useId()
  const { modify, add } = useGroups()
  const [show, setShow] = useState(true)

  const closeModal = () => {
    setShow(false)
    setTimeout(close, 300)
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(GroupValidation),
    defaultValues: initialValues
  })

  const handleAddGroup = async values => {
    const status = await add({ ...values })
    notifier.addGroup(status)
    if (status) closeModal()
  }

  const handleModifyGroup = async values => {
    const status = await modify({ id: initialValues.id, ...values })
    notifier.modifyGroup(status)
    if (status) closeModal()
  }

  const _modify = type === 'modify'
  const onSubmit = v => _modify ? handleModifyGroup(v) : handleAddGroup(v)
  const title = _modify ? t('create-group') : t('modify-group')

  return (
    <Modal show={show} backdrop='static' onHide={closeModal} scrollable={true}>
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
