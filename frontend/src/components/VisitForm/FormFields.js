import React from 'react'

export const TextField = (field) => {
  const { handleChange, handleBlur, values, touched, errors, label, fieldName, style, type='input' } = field
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