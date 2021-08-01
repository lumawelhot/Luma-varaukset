import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const InputField = ({ add, item, cancel, save }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState(item ? item.name : t('form-field-input-name'))
  const [required, setRequired] = useState(item ? item.validation.required : false)

  const handleAdd = () => {
    add({
      name,
      type: 'text',
      validation: {
        required
      }
    })
  }

  const handleSave = () => {
    save({
      name,
      type: 'text',
      validation: {
        required
      }
    })
  }

  return (
    <div className="box">
      <div className="field">
        <label className="label">{t('form-field-label')}</label>
        <p className="control">
          <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        </p>
      </div>
      <div className="field is-grouped">
        <label className="checkbox">
          <input className="checkbox" type="checkbox" checked={required} onChange={() => setRequired(!required)}/>
          {` ${t('form-field-input-required')}`}
        </label>
      </div>
      {item ?
        <>
          <button className="button luma" onClick={() => handleSave()}>{t('save')}</button>
          <button onClick={() => cancel()}>{t('back')}</button>
        </>
        :
        <button className="button luma" onClick={() => handleAdd()}>{t('form-field-add')}</button>
      }
    </div>
  )
}

export default InputField