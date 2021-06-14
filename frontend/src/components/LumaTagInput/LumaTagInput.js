import React, { useState, useRef } from 'react'
import Tags from './Tags'

const LumaTagInput = ({ label, suggestedTags=[], prompt='Lisää tagi', tags=[], setTags, style }) => {

  const [newTag, setNewTag] = useState('')
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState(-1)
  const field = useRef()

  const addTagIfNotExist = (tag) => {
    if (!tags.includes(tag)) {
      setTags(tags.concat(tag))
    }
  }

  const removeLastTag = () => {
    const newTags = tags
    tags.pop()
    setTags([...newTags])
  }

  const handleRemoveTag = (index) => {
    const newTags = tags
    newTags.splice(index,1)
    setTags([...newTags])
  }

  const handleAddTag = (tag) => {
    setNewTag('')
    addTagIfNotExist(tag)
    setFocused(true)
    field.current.focus()
  }

  const handleKeyUp = (event) => {
    if (event.key === 'Escape') { // Blur
      setNewTag('')
      setFocused(false)
    }
  }

  const handleKeyDown = (event, items) => {
    switch (event.key) {
      case 'Backspace': { // Remove last tag if input is empty
        if (newTag === '') {
          event.preventDefault()
          setNewTag('')
          removeLastTag()
          setSelected(-1)
        }
        break
      }
      case 'Tab': {
        event.preventDefault()
        setNewTag('')
        const value = items.length ? items[selected === -1 ? 0 : selected] : newTag
        addTagIfNotExist(value)
        setSelected(-1)
        break
      }
      case 'Enter': {
        event.preventDefault()
        setNewTag('')
        const value = selected > -1 ? items[selected] : newTag
        addTagIfNotExist(value)
        setSelected(-1)
        break
      }
      case ',': {
        event.preventDefault()
        setNewTag('')
        if (newTag !== '') {
          const value = selected > -1 ? items[selected] : newTag
          addTagIfNotExist(value)
          setSelected(-1)
        }
        break
      }
      case 'ArrowDown': { // Move down in autocomplete list
        if (!focused) {
          setFocused(true)
          setSelected(0)
        }
        if (selected < items.length-1) {
          setSelected(selected+1)
        }
        break
      }
      case 'ArrowUp': { // Move up in autocomplete list
        if (selected > -1) {
          setSelected(selected-1)
        }
        break
      }
      default: {
        if (newTag !== '') {
          setFocused(true)
        }
        else {
          setSelected(-1)
        }
      }
    }
  }

  const focusInCurrentTarget = ({ relatedTarget, currentTarget=field }) => {
    if (relatedTarget === null) return false

    var node = relatedTarget.parentNode

    while (node !== null) {
      if (node === currentTarget) return true
      node = node.parentNode
    }

    return false
  }

  const handleBlur = (e) => {
    if (!focusInCurrentTarget(e)) {
      setFocused(false)
    }
  }

  const dropdownItems = newTag === '' ?
    suggestedTags.filter(element => !tags.includes(element))
    :
    suggestedTags.filter(element => !tags.includes(element)).filter(element => element.toLowerCase().includes(newTag.toLowerCase()))

  return (
    <div className='field' style={style} onBlur={handleBlur}>
      <label className='label'>{label}</label>
      <div className='taginput control'>
        <div className={`taginput-container is-focusable ${focused && 'is-focused'}`}>
          <Tags
            tags={tags}
            removeTag={(index) => handleRemoveTag(index)}
          />
          <div className='autocomplete control'>
            <div className='control is-clearfix'>
              <input
                ref={field}
                value={newTag}
                type="text"
                autoComplete="off"
                placeholder={prompt}
                className="input"
                onChange={(e) => setNewTag(e.target.value)}
                onKeyUp={e => handleKeyUp(e)}
                onKeyDown={e => handleKeyDown(e, dropdownItems)}
                onFocus={() => setFocused(true)}
              />
            </div>
            <div className='dropdown-menu' style={{ display: focused && dropdownItems.length > 0 ? 'block' : 'none' }}>
              <div className='dropdown-content'>
                {dropdownItems.sort().map((suggestion,index) =>
                  <a
                    key={index}
                    className={`dropdown-item ${selected === index ? 'is-hovered' : ''}`}
                    style={{ background: selected === index ? '#f5f5f5' : '' }}
                    onMouseDown={(e) => handleAddTag(suggestion,e)}
                  >
                    <span>{suggestion}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LumaTagInput