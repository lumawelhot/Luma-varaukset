import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { useMisc } from '../../../hooks/cache'
import Form from './Form'
import Info from './Info'

const Emails = ({ show, close, template }) => {
  const [info, showInfo] = useState()
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
        {info && <Info />}
        <div className={info ? 'hidden' : 'visible'}>
          <Form initialValues={{
            ...template,
            senderText: template.adText
          }} formId={formId} onSubmit={handleModify} />
        </div>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {!info && <Button onClick={() => showInfo(true)}>{t('show-email-info')}</Button>}
        {info && <Button onClick={() => showInfo(false)}>{t('show-email-form')}</Button>}
        <Button className='active' type='submit' form={formId}>{t('modify-emails')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Emails
