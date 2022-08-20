import { toast } from 'react-toastify'

export const success = message => toast.success(message, {
  position: 'bottom-left',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored'
})

export const error = message => toast.error(message, {
  position: 'bottom-left',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'colored'
})
