import React, { useContext, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../Embeds/Button'
import { MiscContext } from '../../../services/contexts'
import Form from './Form'

const Emails = ({ show, close, template }) => {
  const { modifyEmail } = useContext(MiscContext)
  const { t } = useTranslation()
  const formRef = useRef()

  const handleModify = async () => {
    const values = formRef?.current?.values
    if (await modifyEmail(values)) close()
  }

  if (!template) return <></>

  return (
    <Modal
      show={show}
      backdrop="static"
      size="lg"
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('email-template')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 400 }}>
        <Form
          ref={formRef}
          initialValues={template}
        />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button onClick={handleModify}>{t('modify-emails')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Emails