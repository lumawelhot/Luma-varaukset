import { error, success } from './toasts'
import { t } from '../i18n'

export const notifier = {
  modifyVisit: r => r
    ? success(t('notify-modify-visit-success'))
    : error(t('notify-modify-visit-failed')),
  createVisit: r => r
    ? success(t('notify-booking-success'))
    : error(t('notify-booking-failed')),
  createEvent: r => r
    ? success(t('notify-event-add-success'))
    : error(t('notify-event-add-failed')),
  modifyEvent: r => r
    ? success(t('notify-event-modify-success'))
    : error(t('notify-event-modify-failed')),
  createForm: r => r
    ? success(t('notify-form-add-success'))
    : error(t('notify-form-add-failed'))
}
