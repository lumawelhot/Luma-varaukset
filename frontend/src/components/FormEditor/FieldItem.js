import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from './Fields/TextField'
import RadioField from './Fields/RadioField'
import CheckboxField from './Fields/CheckboxField'

const FieldItem = ({ item, remove, update, down, up }) => {

  if (!item) return null

  const { t } = useTranslation('user')
  const [editMode, setEditMode] = useState(false)
  const [showActionButtons, setShowActionButtons] = useState(false)

  const drawField = () => {
    if (!item.type) return null

    if (item.type === 'text') return (<input className="input" type="text" placeholder="Text input"></input>)
    if (item.type === 'radio') return (
      <p className="control">
        {item.options.map(o => <label key={o.value} className="radio"><input type="radio" name={item.name}/>{o.text}</label>)}
      </p>
    )
    if (item.type === 'checkbox') return (
      <p className="control">
        {item.options.map(o => <label key={o.value} className="checkbox"><input type="checkbox" name={item.name}/>{o.text}</label>)}
      </p>
    )
  }

  const handleSaveField = (data) => {
    setEditMode(false)
    update(data)
  }

  const drawEditor = () => {
    if (!item.type) return null
    if (item.type === 'text') return <TextField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'radio') return <RadioField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'checkbox') return <CheckboxField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
  }

  const handleAction = (type) => {
    setEditMode(false)
    if (type === 'remove') remove()
    if (type === 'up') up()
    if (type === 'down') down()
  }

  return (
    <div className="media" onMouseLeave={() => setShowActionButtons(false)}>
      {editMode && drawEditor()}
      {!editMode && (
        <button className="media-content" onMouseEnter={() => setShowActionButtons(true)} onClick={() => setEditMode(true)}>
          <div className="field formeditor">
            <label className="label">{item.name}{item.validation?.required ? <span className="tag is-small">{t('form-field-input-required')}</span> : null}</label>
            {drawField()}
          </div>
        </button>
      )}
      <div className="media-right">
        {showActionButtons && <>
          <button className="button is-small" onClick={() => handleAction('remove')}>{t('form-field-remove')}</button>
          {down === null ?
            <button className="button is-small" disabled>{t('form-field-move-down')}</button>
            :
            <button className="button is-small" onClick={() => handleAction('down')}>{t('form-field-move-down')}</button>}
          {up === null ?
            <button className="button is-small" disabled>{t('form-field-move-up')}</button>
            :
            <button className="button is-small" onClick={() => handleAction('up')}>{t('form-field-move-up')}</button>}
        </>}
      </div>
    </div>
  )
}

export default FieldItem