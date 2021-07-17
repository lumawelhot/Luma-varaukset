import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const RadioField = ({ add }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState(t('form-field-input-name'))
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState([{ value: 1, text: t('form-field-radio-value') + '-1' }, { value: 2, text: t('form-field-radio-value') + '-2' }])

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
    options[index].value = value
    setOptions([...options])
  }

  const setOptionText = (index, value) => {
    options[index].text = value
    setOptions([...options])
  }

  const addOption = () => {
    setOptions(options.concat({ value: options.length+1, text: t('form-field-radio-value') + '-' + (options.length+1) }))
  }

  return (
    <div className="box">
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">{t('form-field-label')}</label>
        </div>
        <div className="field-body">
          <p className="control">
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
          </p>
        </div>
      </div>
      <p>{t('form-options')}</p>
      {options.map((o,index) =>
        <div className="field-is-horizontal" key={index}>
          <div className="field-body is-grouped">
            <p className="control">
              <input className="input" type="text" value={o.value} onChange={(e) => setOption(index, e.target.value)}/>
            </p>
            <p className="control">
              <input className="input" type="text" value={o.text} onChange={(e) => setOptionText(index, e.target.value)}/>
            </p>
          </div>
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

export default RadioField