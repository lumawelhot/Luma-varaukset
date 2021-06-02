import React from 'react'

const Tags = ({ tags, removeTag }) => {

  return (
    <>
      {tags.map((tag,index) =>
        <span key={index} className='tag is-info'>
          <span>{tag}</span>
          <a role="button" className="delete is-small" onClick={() => removeTag(index)}></a>
        </span>
      )}
    </>
  )
}

export default Tags