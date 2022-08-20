import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { Button } from '../../Embeds/Button'
import Form from './Form'

const Extra = ({ show, close, handle, title, initialValues }) => {
  const formId = useId()
  const onSubmit = async values => {
    await handle({ ...values, classes: values.classes.map(c => Number(c)) })
    close()
  }

  return (
    <Modal show={show} backdrop='static' onHide={close} scrollable={true} >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form formId={formId} initialValues={initialValues} onSubmit={onSubmit} />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} className='active' type='submit'>{title}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Extra
