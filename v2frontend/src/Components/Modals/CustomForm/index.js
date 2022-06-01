import React, { useContext, useRef, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { DEFAULT_FIELD_VALUES } from '../../../config'
import { Button } from '../../../Embeds/Button'
import { customformInit } from '../../../helpers/initialvalues'
import { FormContext } from '../../../services/contexts'
import Form from './Form'

const CustomForm = ({ show, close, initialValues=customformInit, modify }) => {
  const { t } = useTranslation()
  const [onModify, setOnModify] = useState()
  const formRef = useRef()
  const [fields, setFields] = useState(initialValues.fields)
  const { add, modify: mod } = useContext(FormContext)

  const getField = () => {
    const fieldValues = formRef?.current?.values
    const details = {
      name: fieldValues.question,
      type: fieldValues.type,
      validation: { required: fieldValues.required }
    }
    if (fieldValues.type === 'text') return details
    else return {
      ...details,
      options: fieldValues.options.map((f, i) => ({ value: i, text: f })),
    }
  }

  const reset = () => {
    formRef.current.setFieldValue('question', '')
    formRef.current.setFieldValue('options', DEFAULT_FIELD_VALUES)
  }

  const handleAddField = () => {
    setFields(fields.concat(getField()))
    reset()
  }

  const handleModifyField = () => {
    setOnModify(undefined)
    setFields(fields.map((f, i) => onModify.id === i ? getField() : f))
    reset()
  }

  const handleModify = id => {
    setOnModify({ ...fields[id], id })
    const { name, options, type, validation } = fields[id]
    formRef?.current?.setFieldValue('question', name)
    formRef?.current?.setFieldValue('options', options ? options.map(o => o.text) : DEFAULT_FIELD_VALUES)
    formRef?.current?.setFieldValue('type', type)
    formRef?.current?.setFieldValue('required', validation.required)
  }

  const handleAddForm = async () => {
    const { errors, dirty } = formRef.current
    if (Object.keys(errors).length || !dirty) {
      console.log(errors) // toast here
      return
    }
    if (await add({
      fields: JSON.stringify(fields),
      name: formRef?.current.values.name
    })) close()
  }

  const handleModifyForm = async () => {

    if (await mod({
      fields: JSON.stringify(fields),
      name: formRef?.current.values.name,
      id: initialValues.id
    })) close()
  }

  return (
    <Modal
      show={show}
      backdrop="static"
      size="lg"
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{modify ? t('modify-form') : t('create-form')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 400 }}>
        <Form
          ref={formRef}
          initialValues={initialValues}
          fields={fields}
          setFields={setFields}
          onModify={onModify}
          handleModify={handleModify}
        />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {!onModify && <Button onClick={handleAddField}>{t('add-form-field')}</Button>}
        {onModify && <Button onClick={handleModifyField}>{t('modify-form-field')}</Button>}
        {!modify && <Button onClick={handleAddForm} className='active'>{t('create-custom-form')}</Button>}
        {modify && <Button onClick={handleModifyForm} className='active'>{t('modify-custom-form')}</Button>}
      </Modal.Footer>
    </Modal>
  )
}

export default CustomForm
