import React, { useId } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useExtras } from '../../../hooks/cache'
import { useCloseModal } from '../../../hooks/utils'
import { Button } from '../../Embeds/Button'
import Form from './Form'
import PropTypes from 'prop-types'

const Extra = ({ close, initialValues, type }) => {
  const formId = useId()
  const { add, modify } = useExtras()
  const [show, closeModal] = useCloseModal(close)
  const { t } = useTranslation()

  const handle = type === 'modify' ? modify : add
  const onSubmit = async values => {
    await handle({ ...values, classes: values.classes.map(c => Number(c)) })
    close()
  }

  const title = type === 'modify' ? t('modify-extra') : t('create-extra')
  return (
    <Modal show={show} backdrop='static' onHide={closeModal} scrollable={true} >
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

Extra.propTypes = {
  close: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  initialValues: PropTypes.object
}
