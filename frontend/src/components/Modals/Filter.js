import { Modal, Stack } from 'react-bootstrap'
import React from 'react'
import { Button, Checkbox } from '../Embeds/Button'
import { useTranslation } from 'react-i18next'
import { Select } from '../Embeds/Input'
import { CLASSES, GRADES } from '../../config'
import { CheckboxGroup } from '@chakra-ui/react'
import Title from '../Embeds/Title'
import { useEvents, useMisc } from '../../hooks/cache'
import { useCloseModal } from '../../hooks/utils'
import PropTypes from 'prop-types'

const Filter = ({ close }) => {
  const { t } = useTranslation()
  const { tags, fetchTags } = useMisc()
  const { filterOptions, setFilterOptions } = useEvents()
  const [show, closeModal] = useCloseModal(close)

  return (
    <Modal show={show} backdrop='static' size='lg' onHide={closeModal} scrollable={true}>
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
          <Checkbox value='remote' style={{ marginRight: 15 }}>{t('remote')}</Checkbox>
          <Checkbox value='inperson' style={{ marginRight: 15 }}>{t('inperson')}</Checkbox>
          <Checkbox value='school'>{t('school')}</Checkbox>
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
        <Button onClick={closeModal}>{t('OK')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Filter

Filter.propTypes = {
  close: PropTypes.func.isRequired,
}
