import { toast } from 'react-toastify'
import { t } from '../i18n'

const config = {
  position: 'bottom-left',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored'
}

const success = message => toast.success(message, config)
const error = message => toast.error(message, config)

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
    : error(t('notify-form-add-failed')),
  createUser: r => r
    ? success(t('notify-user-create-success'))
    : error(t('notify-user-create-failed')),
  modifyForm: r => r
    ? success(t('notify-form-modify-success'))
    : error(t('notify-form-modify-failed')),
  login: r => r ? undefined : error(t('notify-login-failed')),
  modifyUser: r => r
    ? success(t('notify-user-modify-success'))
    : error(t('notify-user-modify-error')),
  modifyGroup: r => r
    ? success(t('notify-group-modify-success'))
    : error(t('notify-group-modify-failed')),
  addGroup: r => r
    ? success(t('notify-group-create-success'))
    : error(t('notify-group-create-failed'))
}
