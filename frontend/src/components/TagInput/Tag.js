import React from 'react'

const Tag = (props) => {

  const {
    attached,
    closable,
    type,
    size,
    rounded,
    disabled,
    ellipsis,
    tabstop,
    ariaCloseLabel,
    closeType,
    closeIcon,
    closeIconPack,
    closeIconType,
    close
  } = { ...props }

  /**
    * Emit close event when delete button is clicked
    * or delete key is pressed.
    */
  const handleClose = (event) => {
    event.preventDefault()
    if (this.disabled) return
    close(event)
  }

  return (
    <>
      {(attached && closable) ?
        <div className="tags has-addons">
          <span className={`tag ${[type, size, rounded && 'is-rounded']}`}>
            <span className={ ellipsis && 'has-ellipsis'}>
              {/*<slot/>*/}
            </span>
          </span>
          <a
            role="button"
            aria-label={ariaCloseLabel}
            tabIndex={tabstop ? 0 : false}
            disabled={disabled}
            className={`tag ${[size,
              closeType,
              rounded && 'is-rounded',
              closeIcon ? 'has-delete-icon' : 'is-delete']}`}
            onClick={(e) => handleClose(e)}
            onKeyUp={(e) => e.delete && handleClose(e)}>
            <span classNme={`icon ${[closeIconType, size]}`}>
              <i className={[closeIconPack, closeIcon]}/>
            </span>
          </a>
        </div>
        :
        <span
          className={`tag ${[type, size, rounded && 'is-rounded']}`}>
          <span className={ ellipsis && 'has-ellipsis'}>
            {/*<slot>*/}
          </span>

          {closable && <a
            role='button'
            aria-label={ariaCloseLabel}
            className={`delete is-small ${closeType}`}
            disabled={disabled}
            tabIndex={tabstop ? 0 : false}
            onClick={(e) => handleClose(e)}
            onKeyUp={(e) => e.delete && handleClose(e)}
          />}
        </span>}
    </>
  )
}

export default Tag