import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../Button'
import {
  BannerImage,
  BannerLink,
  BannerProvider,
  BannerText,
  BannerTextBox,
  BannerTitle
} from './components'

const Banner = ({ show }) => {
  const { t, i18n } = useTranslation()

  return (
    <>
      <BannerProvider show={show}>
        <BannerImage src='/luma-flower.svg' show={show} />
        <BannerTextBox show={show}>
          <BannerTitle>{t('banner-title')}</BannerTitle>
          <BannerText>
            {t('banner-text1')}
            <BannerLink
              href="https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet"
              target="_blank"
              rel="noreferrer"
            >
              {t('banner-text2')}.
            </BannerLink>
            {t('banner-text3')}
          </BannerText>
          <div style={{ marginLeft: -10, marginTop: 5 }}>
            <Button className='active' onClick={() => i18n.changeLanguage('fi-FI')}>FI</Button>
            <Button className='active' onClick={() => i18n.changeLanguage('sv-SV')}>SV</Button>
            <Button className='active' onClick={() => i18n.changeLanguage('en-US')}>EN</Button>
          </div>
        </BannerTextBox>
      </BannerProvider>
    </>
  )
}

export default Banner