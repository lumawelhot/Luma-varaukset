import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fi from './locales/fi/translations.json'
import en from './locales/en/translations.json'
import sv from './locales/sv/translations.json'

export const resources = {
  fi: {
    translation: fi,
    language: 'fi'
  },
  en: {
    translation: en,
    language: 'en'
  },
  sv: {
    translation: sv,
    language: 'sv'
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fi',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  })

export const { t } = i18n

export default i18n
