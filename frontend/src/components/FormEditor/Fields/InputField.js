import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const InputField = ({ add }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState(t('form-field-input-name'))
  const [required, setRequired] = useState(false)

  const handleAdd = () => {
    add({
      name,
      required,
      type: 'input'
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
          {t('form-field-input-required')}
        </label>
      </div>
      <button onClick={() => handleAdd()}>{t('form-field-add')}</button>
    </div>
  )
}

export default InputField