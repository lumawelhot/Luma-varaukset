import React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const MobileBanner = () => {
  const { t, i18n } = useTranslation('common')
  const domNode = document.getElementById('banner')
  return createPortal(
    <>
      <p className="title" style={{ fontSize: '160%' }}>
        {t('banner-title')}
      </p>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('fi-FI')}>FI</button>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('sv-SV')}>SV</button>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('en-US')}>EN</button>
    </>,
    domNode
  )
}

export default MobileBanner