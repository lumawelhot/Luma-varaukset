import { ListItem, UnorderedList } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Link } from '../Embeds/Button'
import { Input, Select, DatePicker, TimePicker } from '../Embeds/Input'
import Title from '../Embeds/Title'
import { useGroups, useEvents } from '../../hooks/cache'
import PropTypes from 'prop-types'
import { useCloseModal } from '../../hooks/utils'

const EventListForms = ({ selected, type, close, reset }) => {
  const { forceRemove, assignToGroup, setPublish } = useEvents()
  const { fetchAll, all: groups } = useGroups()
  const [showSelected, setShowSelected] = useState(false)
  const [show, closeModal] = useCloseModal(close)
  const [password, setPassword] = useState('')
  const [publishDate, setPublishDate] = useState(new Date())
  const [group, setGroup] = useState()
  const { t } = useTranslation()

  const ids = selected.map(s => s.id)

  const handleSetGroup = async () => {
    if (await assignToGroup({ events: ids, group })) {
      closeModal()
      reset()
    }
  }

  const handleSetPublish = async () => {
    if (await setPublish({ events: ids, publishDate: publishDate.toISOString() })) {
      closeModal()
      reset()
    }
  }

  const handleDelete = async () => {
    if (await forceRemove({ events: ids, password })) {
      close()
      reset()
    }
  }

  const getEvents = () => {
    if (showSelected) return <>
      <Title>{t('events')}</Title>
      <UnorderedList>
        {selected.map(event =>
          <ListItem style={{ marginLeft: 10 }} key={event.id}>{event.title}</ListItem>
        )}
      </UnorderedList>
      <div style={{ marginTop: 10 }}>
        <Link onClick={() => setShowSelected(false)}>{t('hide-events')}</Link>
      </div>
    </>
    else return (
      <div style={{ marginTop: 10 }}>
        <Link onClick={() => setShowSelected(true)}>{t('show-events')}</Link>
      </div>
    )
  }

  return (
    <Modal show={show} backdrop='static' onHide={closeModal} scrollable={true}>
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        {type === 'group' && <Modal.Title>{t('add-events-to-group')}</Modal.Title>}
        {type === 'delete' && <Modal.Title>{t('delete-events-confirm')}</Modal.Title>}
        {type === 'publish' && <Modal.Title>{t('set-publish-date')}</Modal.Title>}
      </Modal.Header>
      <Modal.Body>
        {type === 'publish' && <>
          <DatePicker
            value={publishDate}
            onChange={v => setPublishDate(v)}
          />
          <TimePicker
            value={publishDate}
            onChange={v => setPublishDate(v)}
            hideMinutes={minute => minute % 5 !== 0}
          />
        </>}
        {type === 'delete' && <>
          <p style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{t('delete-confirm-warning')}</p>
          {selected?.length > 0 && <Input
            title={t('password')}
            type='password'
            onChange={e => setPassword(e.target.value)}
            value={password}
          />}
        </>}
        {type === 'group' && selected?.length > 0 && <Select
          isMulti={false}
          onClick={fetchAll}
          onChange={e => setGroup(groups?.find(g => g.id === e.value))}
          options={groups?.map(g => ({ value: g.id, label: g.name }))}
        />}
        {getEvents()}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        {type === 'group' && <Button onClick={handleSetGroup}>{t('set-group')}</Button>}
        {type === 'publish' && <Button onClick={handleSetPublish}>{t('set-publishdate')}</Button>}
        {type === 'delete' && <Button onClick={handleDelete}>{t('delete-events')}</Button>}
      </Modal.Footer>
    </Modal>
  )
}

export default EventListForms

EventListForms.propTypes = {
  close: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
  reset: PropTypes.func.isRequired
}
