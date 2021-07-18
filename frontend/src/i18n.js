import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonFI from './locales/fi/common.json'
import eventFI from './locales/fi/event.json'
import visitFI from './locales/fi/visit.json'
import userFI from './locales/fi/user.json'
import commonEN from './locales/en/common.json'
import eventEN from './locales/en/event.json'
import visitEN from './locales/en/visit.json'
import userEN from './locales/en/user.json'
import commonSV from './locales/sv/common.json'
import eventSV from './locales/sv/event.json'
import visitSV from './locales/sv/visit.json'
import userSV from './locales/sv/user.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fi: {
        event: eventFI,
        common: commonFI,
        visit: visitFI,
        user: userFI
      },
      sv: {
        event: eventSV,
        common: commonSV,
        visit: visitSV,
        user: userSV
      },
      en: {
        event: eventEN,
        common: commonEN,
        visit: visitEN,
        user: userEN
      }
    },
    fallbackLng: 'fi',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  })


export default i18n