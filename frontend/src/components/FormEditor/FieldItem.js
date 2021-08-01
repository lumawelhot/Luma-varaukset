import React, { useState } from 'react'
import TextField from './Fields/TextField'
import RadioField from './Fields/RadioField'
import CheckboxField from './Fields/CheckboxField'

const FieldItem = ({ item, update }) => {

  if (!item) return null
  const [editMode, setEditMode] = useState(false)

  const drawField = () => {
    if (!item.type) return null

    if (item.type === 'radio') return (
      <p className="control">
        {item.options.map(o => <label key={o.value} className="radio"><input type="radio" name={item.name}/>{o.text}</label>)}
      </p>
    )
    if (item.type === 'checkbox') return (
      <p className="control">
        {item.options.map(o => <label key={o.value} className="checkbox"><input type="checkbox" name={item.name}/>{o.text}</label>)}
      </p>
    )
  }

  const handleSaveField = (data) => {
    setEditMode(false)
    update(data)
  }

  const drawEditor = () => {
    if (!item.type) return null
    if (item.type === 'text') return <TextField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'radio') return <RadioField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
    if (item.type === 'checkbox') return <CheckboxField save={(data) => handleSaveField(data)} item={item} cancel={() => setEditMode(false)}/>
  }

  return (
    <div className="media">
      {editMode && drawEditor()}
      {!editMode && (
        <div className="field formeditor" onClick={() => setEditMode(true)}>
          <label style={{ cursor: 'pointer' }}>{item.name}</label>
          {drawField()}
        </div>
      )}
    </div>
  )
}

export default FieldItem