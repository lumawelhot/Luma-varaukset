import React from 'react'

const Message = ({ message }) => {
  const style = { color: 'red' }
  return (
    <div className="label" style={style}>
      {message}
    </div>
  )
}

export default Message