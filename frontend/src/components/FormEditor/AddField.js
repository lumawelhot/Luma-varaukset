import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from './Fields/TextField'
import RadioField from './Fields/RadioField'
import CheckboxField from './Fields/CheckboxField'

const AddField = ({ add }) => {
  const { t } = useTranslation('user')
  const [showOptions, setShowOptions] = useState(false)
  const [component, setComponent] = useState(null)

  const renderComponent = () => {
    if (!showOptions) return null
    if (component === 'text') return <TextField add={handleAdd}/>
    if (component === 'radio') return <RadioField add={handleAdd}/>
    if (component === 'checkbox') return <CheckboxField add={handleAdd}/>
    return null
  }

  const handleAdd = (data) => {
    setShowOptions(false)
    add(data)
  }

  return (
    <div>
      <nav className="level-left" role="navigation" aria-label="add formfield">
        {showOptions ?
          <button className="button luma" onClick={() => setShowOptions(!showOptions)}>{'<'}</button>
          :
          <button className="button luma" onClick={() => setShowOptions(!showOptions)}>{t('form-field-add')}</button>
        }
        {showOptions &&
          <>
            <button className="button luma" onClick={() => setComponent('text')}>{t('form-field-input')}</button>
            <button className="button luma" onClick={() => setComponent('radio')}>{t('form-field-radio')}</button>
            <button className="button luma" onClick={() => setComponent('checkbox')}>{t('form-field-checkbox')}</button>
          </>
        }
      </nav>
      {renderComponent()}
    </div>
  )
}

export default AddField