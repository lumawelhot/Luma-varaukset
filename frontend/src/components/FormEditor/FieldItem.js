import React, { useState } from 'react'
import TextField from './Fields/TextField'
import RadioField from './Fields/RadioField'
import CheckboxField from './Fields/CheckboxField'
import { useTranslation } from 'react-i18next'
import { Popconfirm } from 'antd'
import { EditOutlined } from '@ant-design/icons'

const FieldItem = ({ index, item, update, remove, down, up }) => {
  const { t } = useTranslation('user')

  if (!item) return null
  const [editMode, setEditMode] = useState(false)

  const handleSaveField = (index, data) => {
    setEditMode(false)
    update(index, data)
  }

  const drawEditor = () => {
    if (!item.type) return null
    if (item.type === 'text') return <TextField save={(data) => handleSaveField(index, data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'radio') return <RadioField save={(data) => handleSaveField(index, data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'checkbox') return <CheckboxField save={(data) => handleSaveField(index, data)} item={item} cancel={() => setEditMode(false)}/>
  }

  const handleAction = (type) => {
    setEditMode(false)
    if (type === 'remove') remove()
    if (type === 'up') up()
    if (type === 'down') down()
  }

  return (
    <tr>
      {editMode &&
        <td colSpan="4">
          {drawEditor()}
        </td>
      }
      {!editMode &&
      <>
        <td>
          <div className="media">
            <div className="field formeditor" onClick={() => setEditMode(true)}>
              <label style={{ cursor: 'pointer' }}><EditOutlined /> {item.name}</label>
            </div>
          </div>
        </td>
        <td>
          {item.validation.required ? t('yes') : t('no') }
        </td>
        <td>
          {t(item.type)}
        </td>
        <td>
          <Popconfirm
            title={t('form-field-remove-confirm')}
            onConfirm={() => handleAction('remove')}
            okText={t('yes')}
            cancelText={t('no')}
          >
            <button className="button is-small">{t('form-field-remove')}</button>
          </Popconfirm>
          {down === null ?
            <button className="button is-small" disabled>{t('form-field-move-down')}</button>
            :
            <button className="button is-small" onClick={() => handleAction('down')}>{t('form-field-move-down')}</button>}
          {up === null ?
            <button className="button is-small" disabled>{t('form-field-move-up')}</button>
            :
            <button className="button is-small" onClick={() => handleAction('up')}>{t('form-field-move-up')}</button>}
        </td>
      </>}
    </tr>
  )
}

export default FieldItem