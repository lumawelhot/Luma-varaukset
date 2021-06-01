import React, { useState, useRef } from 'react'
import Autocomplete from './Autocomplete'
import Tag from './Tag'

const TagInput = (props) => {

  const {
    value, // Array
    data, // Array
    //type, // String,
    //closeType, // String,
    maxtags,
    hasCounter,
    field=value,
    //autocomplete=true, //Boolean
    //groupField, // String
    //groupOptions, // String,
    nativeAutocomplete, // String,
    openOnFocus, // Boolean,
    keepFirst, // Boolean,
    disabled, // Boolean,
    ellipsis, // Boolean,
    //closable=true, // Boolean
    //ariaCloseLabel, // String,
    confirmKeys= [',', 'Tab', 'Enter'], // Array
    //removeOnKeys= ['Backspace'], // Array
    //allowNew, // Boolean,
    //onPasteSeparators=[','], // Array
    //beforeAdding=() => true,
    //allowDuplicates=false
  } = props

  // eslint-disable-next-line no-unused-vars
  const [tags, setTags] = useState(Array.isArray(value) ? value.slice(0) : (value || []))
  // eslint-disable-next-line no-unused-vars
  const [newTag, setNewTag] = useState('')
  //  const [isComposing, setIsComposing] = useState(false)

  const autocompleteRef = useRef()

  const removeTag = (index) => {
    console.log(index)
  }

  const onTyping = () => {
    // do nothing
  }

  const onFocus = () => {
    // do nothing
  }

  const customOnBlur = () => {
    // do nothing
  }

  const onSelect = () => {
    // do nothing
  }

  const hasInput = true
  const maxlength = 100

  return (
    <div className='taginput control'>
      <div
        className='taginput-container'
        disabled={disabled}
        onClick={(event) => hasInput && focus(event)}>
        {tags.map((tag, index) =>
          <Tag
            key={tag + index}
            type="type"
            close-type="closeType"
            size="size"
            rounded="rounded"
            attached="attached"
            tabstop="false"
            disabled="disabled"
            ellipsis="ellipsis"
            closable="closable"
            aria-close-label="ariaCloseLabel"
            title={ellipsis && tag}
            close={(e) => removeTag(index, e)}>
            {tag}
          </Tag>
        )}

        {hasInput && <Autocomplete
          ref={autocompleteRef}
          value={newTag}
          v-model="newTag"
          data={data}
          field={field}
          disabled={disabled}
          autocomplete={nativeAutocomplete}
          openOnFocus={openOnFocus}
          keepOpen={openOnFocus}
          keepFirst={keepFirst}
          confirm-keys={confirmKeys}
          typing={onTyping}
          focus={onFocus}
          blur={customOnBlur}
          select={onSelect}
        />
        }
      </div>

      { hasCounter && (maxtags || maxlength) && (<small className="help counter">
        {maxlength && newTag.trim().length > 0 && newTag.trim().length + '/' + maxlength }
        {maxtags && tags.length + '/' + maxtags }
      </small>)}
    </div>
  )
}

export default TagInput