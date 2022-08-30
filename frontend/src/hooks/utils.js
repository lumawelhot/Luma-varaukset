import { useState } from 'react'

export const useCloseModal = close => {
  const [show, setShow] = useState(true)

  const closeModal = () => {
    setShow(false)
    setTimeout(close, 300)
  }

  return [show, closeModal]
}
