import { RadioGroup } from '@chakra-ui/react'
import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio } from '../../Embeds/Button'
import { eventInit } from '../../../helpers/initialvalues'
import { useEvents } from '../../../hooks/cache'
import Form from './Form'
import { notifier } from '../../../helpers/notifier'
import { parseEventSubmission } from '../../../helpers/parse'

const Event = ({ show, close, initialValues = eventInit, options, modify }) => {
  const [type, setType] = useState(modify ? 'modify' : 'create')
  const { add, modify : _modify, current: event } = useEvents()
  const { t } = useTranslation()
  const formId = useId()

  const handleModify = async values => {
    const variables = parseEventSubmission(values)
    const modified = await _modify({ ...variables, event: event.id })
    notifier.modifyEvent(modified)
    if (modified) close()
  }

  const handleAdd = async values => {
    const variables = parseEventSubmission(values)
    const added = await add(variables)
    notifier.createEvent(added)
    if (added) close()
  }

  return (
    <Modal
      show={show}
      backdrop='static'
      size='lg'
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{type === 'create' ? t('create') : t('modify')}</Modal.Title>
      </Modal.Header>
      {options && <Modal.Header style={{ display: 'inline' }}>
        <RadioGroup defaultValue={type} onChange={v => setType(v)}>
          <Radio value='create'>{t('create')}</Radio>
          <Radio value='modify' style={{ marginLeft: 20 }}>{t('modify')}</Radio>
        </RadioGroup>
      </Modal.Header>}
      <Modal.Body style={{ minHeight: 400 }}>
        <Form
          formId={formId}
          type={type}
          onSubmit={type === 'create' ? handleAdd : handleModify}
          initialValues={initialValues}
        />
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button form={formId} type='submit'
        >{type === 'create' ? t('create-event') : t('modify-event')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Event
