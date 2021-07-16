import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonFI from './locales/fi/common.json'
import eventFI from './locales/fi/event.json'
import visitFI from './locales/fi/visit.json'
import userFI from './locales/fi/user.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fi: {
        event: eventFI,
        common: commonFI,
        visit: visitFI,
        user: userFI
      }
    },
    fallbackLng: 'fi',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  })


export default i18n