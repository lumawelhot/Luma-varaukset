import React from 'react'
import Toast from './Toast'

const Toasts = ({ toasts }) => {

  return (
    <div className="notices is-top">
      {toasts.map((toast,index) => <Toast key={index} toast={toast}/>)}
    </div>
  )
}

export default Toasts