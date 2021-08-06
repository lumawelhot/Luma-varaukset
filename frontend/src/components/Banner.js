import React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const Banner = () => {
  const { t, i18n } = useTranslation('common')
  const domNode = document.getElementById('banner')
  return createPortal(
    <>
      <p className="title" style={{ fontSize: '160%' }}>
        {t('banner-title')}
      </p>
      <p className="subtitle" style={{ fontSize: '130%' }}>
        {t('banner-text1')}
        <a href="https://www2.helsinki.fi/fi/tiedekasvatus/opettajille-ja-oppimisyhteisoille/varaa-opintokaynti" target="_blank" rel="noreferrer">
          {t('banner-text2')}.
        </a>
        {t('banner-text3')}
      </p>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('fi-FI')}>FI</button>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('sv-SV')}>SV</button>
      <button style={{ marginTop: -20 }} className="button is-small luma primary" onClick={() => i18n.changeLanguage('en-US')}>EN</button>
    </>,
    domNode
  )
}

export default Banner