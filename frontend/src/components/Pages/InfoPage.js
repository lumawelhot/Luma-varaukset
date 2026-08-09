import React from 'react'
import { useTranslation } from 'react-i18next'

const InfoPage = () => {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <section lang='fi'>
        <h2 style={{ fontWeight: '600', paddingBottom: '.25rem', fontSize: '1.25rem' }}>Suomi</h2>
        <p>{t('info-fi')} <a style={{ color: '#0000FF' }} href={`mailto:${t('info-email')}`}>
          {t('info-email')}
        </a>.</p>
      </section>

      <hr
        style={{
          border: 0,
          borderTop: '3px double #000',
          margin: '1.5rem 0',
        }}
      />

      <section lang='sv'>
        <h2 style={{ fontWeight: '600', paddingBottom: '.25rem', fontSize: '1.25rem' }}>Svenska</h2>
        <p>{t('info-sv')} <a style={{ color: '#0000FF' }} href={`mailto:${t('info-email')}`}>
          {t('info-email')}
        </a>.</p>
      </section>

      <hr
        style={{
          border: 0,
          borderTop: '3px double #000',
          margin: '1.5rem 0',
        }}
      />

      <section lang='en' style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: '600', paddingBottom: '.25rem', fontSize: '1.25rem' }}>English</h2>
        <p>{t('info-en')} <a style={{ color: '#0000FF' }} href={`mailto:${t('info-email')}`}>
          {t('info-email')}
        </a>.</p>
      </section>
    </div>
  )
}

export default InfoPage
