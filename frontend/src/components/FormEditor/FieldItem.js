import React from 'react'
import { useTranslation } from 'react-i18next'

const FieldItem = ({ item, remove, down, up }) => {
  const { t } = useTranslation('user')
  return (
    <div className="card">
      <div className="card-content">
        <div className="content">
          {JSON.stringify(item, undefined, 2)}
        </div>
      </div>
      <footer className="card-footer">
        <button className="card-footer-item" onClick={remove}>{t('form-field-remove')}</button>
        {down === null ?
          <button className="card-footer-item" disabled>{t('form-field-move-down')}</button>
          :
          <button className="card-footer-item" onClick={down}>{t('form-field-move-down')}</button>}
        {up === null ?
          <button className="card-footer-item" disabled>{t('form-field-move-up')}</button>
          :
          <button className="card-footer-item" onClick={up}>{t('form-field-move-up')}</button>}
      </footer>
    </div>
  )
}

export default FieldItem