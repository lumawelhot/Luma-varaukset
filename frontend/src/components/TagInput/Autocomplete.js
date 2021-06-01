import React, { useState, useRef, useEffect } from 'react'

function toCssWidth(width) {
  return width === undefined ? null : (isNaN(width) ? width : width + 'px')
}

const Autocomplete = (props) => {
  const {
    value,
    data,
    expanded,
    keepFirst,
    keepOpen,
    clearOnSelect,
    openOnFocus,
    maxHeight,
    dropdownPosition,
    appendToBody,
    loading,
    typing,
    focus,
    blur
  } = { ...props }

  const confirmKeys = ['Tab', 'Enter']

  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [newValue, setNewValue] = useState(value)
  const [isListInViewportVertically, setIsListInViewportVertically] = useState(true)
  const [hasFocus, setHasFocus] = useState(false)
  const [whiteList, setWhiteList] = useState([])
  const elementRef = useRef()
  const dropdown = useRef()

  const focused = (event) => {
    console.log(event)
    if (selected === newValue) {
      elementRef.select()
    }
    if (openOnFocus) {
      setIsActive(true)
      if (keepFirst) {
        selectFirstOption(data)
      }
    }
    setHasFocus(true)
    focus(event)
  }

  const handleBlur = (event) => {
    setHasFocus(false)
    console.log(event)
    blur(event)
  }

  const handleInput = (event) => {
    const currentValue = selected
    if (currentValue && currentValue === newValue) return
    console.log(event)
    typing(newValue)
    //this.checkValidity()
  }

  const handleKeyUp = (event) => {
    if (event.esc) {
      event.preventDefault()
      setIsActive(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.up) {
      keyArrows('up')
    }
    if (event.down) {
      keyArrows('down')
    }
    keydown(event)
  }

  const isEmpty = () => {
    if (!this.data) return true
    return !this.data.some((element) => element.items && element.items.length)
  }


  /**
   * Check if exists "empty" slot
   */
  const hasEmptySlot = () => {
    //return !!this.$slots.empty
    return false
  }
  /**
   * Check if exists "header" slot
   */
  const hasHeaderSlot = () => {
    //return !!this.$slots.header
    return false
  }
  /**
   * Check if exists "footer" slot
   */
  const hasFooterSlot = () => {
    //return !!this.$slots.footer
    return false
  }
  /**
   * Apply dropdownPosition property
   */
  const isOpenedTop = () => {
    return (
      dropdownPosition === 'top' ||
              (dropdownPosition === 'auto' && !isListInViewportVertically)
    )
  }

  const contentStyle = () => {
    return {
      maxHeight: toCssWidth(maxHeight)
    }
  }

  const setHoveredItem = (option) => {
    if (option === undefined) return
    setHovered(option)
  }

  /**
   * Set which option is currently selected, update v-model,
   * update input value and close dropdown.
   */
  const setSelectedItem = (option, closeDropdown = true, event = undefined) => {
    if (option === undefined) return
    setSelected(option)
    this.$emit('select', selected, event)
    if (selected !== null) {
      setNewValue(clearOnSelect ? '' : selected)
      setHoveredItem(null)
    }
    closeDropdown && this.$nextTick(() => {
      setIsActive(false)
    })
    this.checkValidity()
  }
  /**
   * Select first option
   */
  const selectFirstOption = (element) => {
    this.$nextTick(() => {
      if (element.length) {
        // If has visible data or open on focus, keep updating the hovered
        const option = element[0].items[0]
        if (openOnFocus || (newValue !== '' && hovered !== option)) {
          setHoveredItem(option)
        }
      } else {
        setHoveredItem(null)
      }
    })
  }

  const keydown = (event) => {
    const { key } = event // cannot destructure preventDefault (https://stackoverflow.com/a/49616808/2774496)
    // prevent emit submit event
    if (key === 'Enter') event.preventDefault()
    // Close dropdown on Tab & no hovered
    setIsActive(key !== 'Tab')
    if (hovered === null) return
    if (confirmKeys.indexOf(key) >= 0) {
      // If adding by comma, don't add the comma to the input
      if (key === ',') event.preventDefault()
      // Close dropdown on select by Tab
      const closeDropdown = !keepOpen || key === 'Tab'
      setSelectedItem(hovered, closeDropdown, event)
    }
  }
  /**
   * Close dropdown if clicked outside.
   */
  const clickedOutside = (event) => {
    const target = event.target
    if (!hasFocus && whiteList.indexOf(target) < 0) {
      if (keepFirst && hovered) {
        setSelectedItem(hovered, true)
      } else {
        setIsActive(false)
      }
    }
  }
  /**
   * Calculate if the dropdown is vertically visible when activated,
   * otherwise it is openened upwards.
   */
  const calcDropdownInViewportVertical = () => {
    this.$nextTick(() => {
      /**
           * this.$refs.dropdown may be undefined
           * when Autocomplete is conditional rendered
           */
      if (dropdown === undefined) return
      const rect = dropdown.getBoundingClientRect()
      setIsListInViewportVertically(rect.top >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
    })
  }
  /**
   * Arrows keys listener.
   * If dropdown is active, set hovered option, or else just open.
   */
  const keyArrows = (direction) => {
    const sum = direction === 'down' ? 1 : -1
    if (isActive) {
      const tmpdata = data.map(
        (d) => d.items).reduce((a, b) => ([...a, ...b]), [])
      let index = tmpdata.indexOf(hovered) + sum
      index = index > tmpdata.length - 1 ? tmpdata.length - 1 : index
      index = index < 0 ? 0 : index
      setHoveredItem(tmpdata[index])
      const list = dropdown.querySelector('.dropdown-content')
      const element = list.querySelectorAll('a.dropdown-item:not(.is-disabled)')[index]
      if (!element) return
      const visMin = list.scrollTop
      const visMax = list.scrollTop + list.clientHeight - element.clientHeight
      if (element.offsetTop < visMin) {
        list.scrollTop = element.offsetTop
      } else if (element.offsetTop >= visMax) {
        list.scrollTop = element.offsetTop - list.clientHeight + element.clientHeight
      }
    } else {
      setIsActive(true)
    }
  }

  useEffect(() => {
    if (dropdownPosition === 'auto') {
      if (isActive) {
        calcDropdownInViewportVertical()
      } else {
        // Timeout to wait for the animation to finish before recalculating
        setTimeout(() => {
          calcDropdownInViewportVertical()
        }, 100)
      }
    }
  },[isActive])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('click', clickedOutside)
      if (dropdownPosition === 'auto') { window.addEventListener('resize', calcDropdownInViewportVertical) }
    }
  },[])

  useEffect(() => {
    const newWhiteList = []
    newWhiteList.push(elementRef.current)
    newWhiteList.push(dropdown.current)
    console.log(dropdown.current)
    // Add all children from dropdown
    /*if (dropdown !== undefined) {
      const children = dropdown.current.children
      for (const child of children) {
        newWhiteList.push(child)
      }
    /* if (this.$parent.$data._isTaginput) {
      // Add taginput container
      newWhiteList.push(this.$parent.$el)
      // Add .tag and .delete
      const tagInputChildren = this.$parent.$el.querySelectorAll('*')
      for (const tagInputChild of tagInputChildren) {
        newWhiteList.push(tagInputChild)
      }
    } */
    setWhiteList(newWhiteList)
  },[dropdown, elementRef])

  return (
    <div className={`autocomplete control ${expanded && 'is-expanded'}`}>
      <div className='control'>
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          ref={elementRef}
          type='text'
          loading={loading}
          autoComplete='off'
          onInput={(e) => handleInput(e)}
          onFocus={(e) => focused(e)}
          onBlur={(e) => handleBlur(e)}
          onKeyUp={(e) => handleKeyUp(e)}
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </div>
      {isActive && (!isEmpty || hasEmptySlot || hasHeaderSlot) &&
        <div
          className={`dropdown-menu ${isOpenedTop && !appendToBody && 'is-opened-top'}`}
          ref={dropdown}
        >
          {isActive && <div
            className='dropdown-content'
            style={contentStyle}>
            {hasHeaderSlot && <div className="dropdown-item">
              {/*<slot name="header" />*/}
            </div>}
            {data.map((element, groupIndex) =>
              <>
                {element.group && <div
                  key={groupIndex}
                  className="dropdown-item">
                  <span className="has-text-weight-bold">
                    {element.group}
                  </span>
                </div>}
                {element.items.map((option,index) =>
                  <a
                    key={groupIndex + ':' + index}
                    className={`dropdown-item ${option === hovered && 'is-hovered'}`}
                    onClick={(event) => setSelected(option, undefined, event)}
                  >
                    <span>
                      {option}
                    </span>
                  </a>)}
              </>
            )}
            {isEmpty && hasEmptySlot &&
                  <div className="dropdown-item is-disabled">
                    {/*<slot name="empty" />*/}
                  </div>}
            {hasFooterSlot &&
                <div className="dropdown-item">
                  {/*<slot name="footer" />*/}
                </div>}
          </div>}
        </div>}
    </div>
  )
}

export default Autocomplete