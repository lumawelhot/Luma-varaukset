import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const CheckboxField = ({ add }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState(t('form-field-input-name'))
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState([t('form-field-checkbox-value') + '-1', t('form-field-checkbox-value') + '-2'])

  const handleAdd = () => {
    add({
      name,
      options,
      type: 'radio',
      validation: {
        required
      }
    })
  }

  const setOption = (index, value) => {
    options[index] = value
    setOptions([...options])
  }

  const addOption = () => {
    setOptions(options.concat(t('form-field-checkbox-value') + '-' + (options.length+1)))
  }

  return (
    <div className="box">
      <div className="field">
        <label className="label">{t('form-field-label')}</label>
        <p className="control">
          <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        </p>
      </div>
      {options.map((o,index) =>
        <div className="field" key={index}>
          <label className="label">{t('form-field-label')}</label>
          <p className="control">
            <input className="input" type="text" value={o} onChange={(e) => setOption(index, e.target.value)}/>
          </p>
        </div>
      )}
      <button onClick={() => addOption()}>+</button>
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

export default CheckboxField