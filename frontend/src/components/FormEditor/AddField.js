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
      <nav className="navbar" role="navigation" aria-label="add formfield">
        <div className="navbar-brand">
          <div className="navbar-item">
            {showOptions ?
              <button className="button luma" onClick={() => setShowOptions(!showOptions)}>{'<'}</button>
              :
              <button className="button luma" onClick={() => setShowOptions(!showOptions)}>{t('form-field-add')}</button>
            }
          </div>
        </div>
        {showOptions && (
          <div className="navbar-menu">
            <div className="navbar-start">
              <div className="navbar-item">
                <button className="button luma" onClick={() => setComponent('text')}>{t('form-field-input')}</button>
              </div>
              <div className="navbar-item">
                <button className="button luma" onClick={() => setComponent('radio')}>{t('form-field-radio')}</button>
              </div>
              <div className="navbar-item">
                <button className="button luma" onClick={() => setComponent('checkbox')}>{t('form-field-checkbox')}</button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {renderComponent()}
    </div>
  )
}

export default AddField