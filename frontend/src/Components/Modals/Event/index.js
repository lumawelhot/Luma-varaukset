import { RadioGroup } from '@chakra-ui/react'
import React, { useId, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Radio } from '../../Embeds/Button'
import { eventInit } from '../../../helpers/initialvalues'
import { error, success } from '../../../helpers/toasts'
import { useEvents } from '../../../hooks/api'
import Form from './Form'

const Event = ({ show, close, initialValues=eventInit, options, modify }) => {
  const [type, setType] = useState(modify ? 'modify' : 'create')
  const { add, modify : mod, current: event } = useEvents()
  const [dates, setDates] = useState([])
  const { t } = useTranslation()
  const formId = useId()

  const getArguments = values => {
    const { tags, resourceids, grades, remotePlatforms, group, extras, customForm } = values
    return {
      ...values,
      dates: dates.map(d => new Date(d.date).toISOString()),
      tags: tags.map(t => t.label),
      resourceids: resourceids.map(r => Number(r)),
      grades: grades.map(g => Number(g)),
      remotePlatforms: remotePlatforms.map(r => Number(r)),
      group: group?.value ? group.value : (modify ? '' : null),
      extras,
      customForm: customForm?.value ? customForm.value : null
    }
  }

  const handleModify = async values => {
    const modified = await mod({ ...getArguments(values), event: event.id })
    if (modified) {
      success(t('notify-event-modify-success'))
      close()
    } else error(t('notify-event-modify-failed'))
  }

  const handleAdd = async values => {
    const added = await add(getArguments(values))
    if (added) {
      success(t('notify-event-add-success'))
      close()
    } else error(t('notify-event-add-failed'))
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
          dates={dates}
          setDates={setDates}
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
