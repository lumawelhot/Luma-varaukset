import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { useMisc } from '../../../hooks/cache'
import Form from './Form'

const Emails = ({ show, close, template }) => {
  const { modifyEmail } = useMisc()
  const { t } = useTranslation()
  const formId = useId()

  const handleModify = async values => {
    if (await modifyEmail(values)) close()
  }

  if (!template) return <></>

  return (
    <Modal show={show} backdrop='static' size='lg' onHide={close} scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('email-template')}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 400 }}>
        <Form initialValues={{
          ...template,
          senderText: template.adText
        }} formId={formId} onSubmit={handleModify} />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button type='submit' form={formId}>{t('modify-emails')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Emails
