import React, { useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { Button } from '../../../Embeds/Button'
import Form from './Form'

const Extra = ({ show, close, handle, title, initialValues }) => {
  const formRef = useRef()

  const handleSubmit = async () => {
    const { name, inPersonLength, remoteLength, classes } = formRef.current.values
    await handle({
      name,
      inPersonLength: Number(inPersonLength),
      remoteLength: Number(remoteLength),
      classes: classes.map(c => Number(c))
    })
    close()
  }

  return (
    <Modal
      show={show}
      backdrop="static"
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form ref={formRef} initialValues={initialValues} />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button onClick={handleSubmit}>{title}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Extra
