import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BannerImage,
  BannerLink,
  BannerProvider,
  BannerText,
  BannerTextBox,
  BannerTitle
} from './components'

const Banner = ({ show }) => {
  const { t } = useTranslation()

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
        </BannerTextBox>
      </BannerProvider>
    </>
  )
}

export default Banner