import { Modal, Stack } from 'react-bootstrap'
import React from 'react'
import { Button, Checkbox } from '../Embeds/Button'
import { useTranslation } from 'react-i18next'
import { Select } from '../Embeds/Input'
import { CLASSES, GRADES } from '../../config'
import { CheckboxGroup } from '@chakra-ui/react'
import Title from '../Embeds/Title'
import { useEvents, useMisc } from '../../hooks/cache'

const Filter = ({ show, close }) => {
  const { t } = useTranslation()
  const { tags, fetchTags } = useMisc()
  const { filterOptions, setFilterOptions } = useEvents()

  return (
    <Modal
      show={show}
      backdrop='static'
      size='lg'
      onHide={close}
      scrollable={true}
    >
      <Modal.Header style={{ backgroundColor: '#f5f5f5' }} closeButton>
        <Modal.Title>{t('filter')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          title={t('filter-by-tags')}
          onClick={fetchTags}
          value={filterOptions.tags}
          onChange={e => setFilterOptions({ ...filterOptions, tags: e })}
          options={tags}
        />
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
        <Select
          title={t('filter-by-grades')}
          value={filterOptions.grades}
          onChange={e => setFilterOptions({ ...filterOptions, grades: e })}
          options={GRADES.map(g => ({ ...g, label: t(g.label) }))}
        />
        <CheckboxGroup value={filterOptions.visitTypes} onChange={v => {
          setFilterOptions({ ...filterOptions, visitTypes: v })
        }}>
          <Title>{t('filter-by-visit-type')}</Title>
          <Stack style={{ marginLeft: 3 }} direction='horizontal'>
            <Checkbox value='remote' style={{ marginRight: 15 }}>{t('remote')}</Checkbox>
            <Checkbox value='inperson'>{t('inperson')}</Checkbox>
          </Stack>
        </CheckboxGroup>
        <Title>{t('another-sort-options')}</Title>
        <Stack style={{ marginLeft: 3 }} direction='horizontal'>
          <Checkbox isChecked={filterOptions.showUnavailable} onChange={e => {
            const { checked } = e.target
            setFilterOptions({ ...filterOptions, showUnavailable: checked })
          }} style={{ marginRight: 15 }}>{t('show-unavailable')}</Checkbox>
        </Stack>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#f5f5f5' }}>
        <Button onClick={close}>{t('OK')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Filter
