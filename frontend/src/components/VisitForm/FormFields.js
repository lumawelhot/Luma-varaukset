import React from 'react'

export const TextField = (field) => {
  const { form, label, fieldName, style, type='input' } = field
  const { handleChange, handleBlur, values, touched, errors } = form
  return (
    <>
      <div className="field" style={style}>
        <label className="label" htmlFor={fieldName}>{label}</label>
        <div className="control">

          <input
            id={fieldName}
            name={fieldName}
            type={type}
            className="input"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values[fieldName]}
          />
        </div>
      </div>
      {touched[fieldName] && errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
  )
}


export const RadioButton = ({ onChange, name, id }) => {
  return (
    <div className="control">
      <input
        type="radio"
        name={id}
        onChange={onChange} /> {name}
    </div>
  )
}

export const CheckBox = (field) => {
  const { form, label, fieldName, onChange } = field
  const { handleChange, values, touched, errors } = form
  return (
    <>
      <div className="field">
        <div className="control">
          <label className="privacyPolicy">
            <input
              type="checkbox"
              name={fieldName}
              checked = {values[fieldName]}
              onChange={onChange ? onChange : handleChange}
            /> {label}
          </label>
        </div>
      </div>
      {touched[fieldName] && errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
  )
}