import { ListItem, UnorderedList } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Button, Link } from '../Embeds/Button'
import { Input, Select } from '../Embeds/Input'
import { DatePicker, TimePicker } from '../Embeds/Picker'
import Title from '../Embeds/Title'
import { useEvents } from '../../hooks/api'
import { useGroups } from '../../hooks/cache'

const EventListForms = ({ selected, type, show, close, reset }) => {
  const { forceRemove, assignToGroup, setPublish } = useEvents()
  const { fetchAll, all: groups } = useGroups()
  const [showSelected, setShowSelected] = useState(false)
  const [password, setPassword] = useState('')
  const [publishDate, setPublishDate] = useState(new Date())
  const [group, setGroup] = useState()
  const { t } = useTranslation()

  const handleSetGroup = async () => {
    const ids = selected.map(s => s.id)
    if (await assignToGroup({ events: ids, group })) {
      reset()
      close()
    }
  }

  const handleSetPublish = async () => {
    const ids = selected.map(s => s.id)
    if (await setPublish({ events: ids, publishDate: publishDate.toISOString() })) {
      reset()
      close()
    }
  }

  const handleDelete = async () => {
    const ids = selected.map(s => s.id)
    if (await forceRemove({ events: ids, password })) {
      reset()
      close()
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
    <Modal
      show={show}
      backdrop='static'
      onHide={close}
    >
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
          {getEvents()}
        </>}
        {type === 'delete' && <>
          <p style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>{t('delete-confirm-warning')}</p>
          {selected?.length > 0 && <>
            <Input
              title={t('password')}
              type='password'
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
            {getEvents()}
          </>}
        </>}
        {type === 'group' && <>
          {selected?.length > 0 && <>
            <Select
              isMulti={false}
              onClick={fetchAll}
              onChange={e => setGroup(groups?.find(g => g.id === e.value))}
              options={groups?.map(g => ({ value: g.id, label: g.name }))}
            />
            {getEvents()}
          </>}
        </>}
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
