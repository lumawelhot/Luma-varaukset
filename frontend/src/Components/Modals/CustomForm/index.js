import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { customformInit } from '../../../helpers/initialvalues'
import { error, success } from '../../../helpers/toasts'
import { useForms } from '../../../hooks/api'
import Form from './Form'
import { notifier } from '../../../helpers/notifier'

const CustomForm = ({ show, close, initialValues = customformInit, modify }) => {
  const { t } = useTranslation()
  const formId = useId()
  const [onModify, setOnModify] = useState()
  const { add, modify: mod } = useForms()

  const handleAddForm = async values => {
    const status = await add({ ...values })
    notifier.createForm(status)
    if (status) close()
  }

  const handleModifyForm = async values => {
    const status = await mod({ ...values, id: initialValues.id })
    if (status) {
      success(t('notify-form-modify-success'))
      close()
    } else error(t('notify-form-modify-failed'))
  }

  const onSubmit = v => modify ? handleModifyForm(v) : handleAddForm(v)

  return (
    <Modal show={show} backdrop='static' size='lg' onHide={close} scrollable={true} >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{modify ? t('modify-form') : t('create-form')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 400 }}>
        <Form
          formId={formId}
          initialValues={initialValues}
          onModify={onModify}
          setOnModify={setOnModify}
          onSubmit={onSubmit}
        />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <div style={{ lineHeight: 3, marginBottom: -5 }}>
          {!onModify && <Button form='custom-add' type='submit'>{t('add-form-field')}</Button>}
          {onModify && <Button form='custom-modify' type='submit'>{t('modify-form-field')}</Button>}
          {!modify && <Button form={formId} type='submit' className='active'>{t('create-custom-form')}</Button>}
          {modify && <Button form={formId} type='submit' className='active'>{t('modify-custom-form')}</Button>}
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default CustomForm
