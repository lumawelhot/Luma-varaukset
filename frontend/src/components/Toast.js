import React from 'react'
import { FaExclamationTriangle, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'

const Toast = ({ toast }) => {

  return (
    <div
      role="alert"
      className={`toast is-top is-${toast.type || 'info'} fadeInRight`}
    >
      <span className="icon">
        {toast.type === 'success' &&
          <FaCheckCircle />
        }
        {toast.type === 'warning' &&
          <FaExclamationTriangle />
        }
        {toast.type === 'danger' &&
          <FaExclamationCircle />
        }
      </span>
      <div>{toast.message}</div>
    </div>
  )
}

export default Toast