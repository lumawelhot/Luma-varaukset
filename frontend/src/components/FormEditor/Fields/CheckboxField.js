import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const CheckboxField = ({ add, item, cancel, save }) => {
  const { t } = useTranslation('user')
  const [name, setName] = useState(item ? item.name : t('form-field-input-name'))
  const [required, setRequired] = useState(item ? item.validation.required : false)
  const initialOptions = item ? item.options : [{ value: 1, text: t('form-field-checkbox-value') + '-1' }, { value: 2, text: t('form-field-checkbox-value') + '-2' }]
  const [options, setOptions] = useState(initialOptions)

  const handleAdd = () => {
    add({
      name,
      options,
      type: 'checkbox',
      validation: {
        required
      }
    })
  }

  const handleSave = () => {
    save({
      name,
      options,
      type: 'checkbox',
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
    setOptions(options.concat({ value: options.length + 1, text: t('form-field-checkbox-value') + '-' + (options.length+1) }))
  }

  const removeOption = index => {
    const newOptions = []
    options
      .filter((_option, i) => i !== index)
      .forEach(option => newOptions.push(
        { value: newOptions.length + 1, text: option.text }
      ))
    console.log(newOptions)
    setOptions(newOptions)
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
        <div className="field-is-horizontal" key={index}>
          <div className="field-body is-grouped">
            <p className="control" style={{ marginRight: 10 }}>
              <input className="input" style={{ width: 70 }} type="text" value={o.value} onChange={(e) => setOption(index, e.target.value)}/>
            </p>
            <p className="control" style={{ marginRight: 10 }}>
              <input className="input" type="text" value={o.text} onChange={(e) => setOptionText(index, e.target.value)}/>
            </p>
            {options.length > 1 &&
              <button className="input" style={{ width: 30, marginRight: 10 }} onClick={() => removeOption(index)}>-</button>
            }
            {options.length === index + 1 &&
              <button className="input" style={{ width: 35 }} onClick={() => addOption()}>+</button>
            }
          </div>
        </div>
      )}
      <div className="field is-grouped">
        <label className="checkbox">
          <input className="checkbox" type="checkbox" checked={required} onChange={() => setRequired(!required)}/>
          {` ${t('form-field-input-required')}`}
        </label>
      </div>
      {item ?
        <>
          <button className="button luma primary" onClick={() => handleSave()}>{t('save')}</button>
          <button className="button luma" onClick={() => cancel()}>{t('back')}</button>
        </>
        :
        <button className="button luma" onClick={() => handleAdd()}>{t('form-field-add')}</button>
      }
    </div>
  )
}

export default CheckboxField