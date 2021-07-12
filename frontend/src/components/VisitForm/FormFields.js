import React from 'react'

const FieldProvider = ({ field, component }) => {
  const { form, label, fieldName, style } = field
  const { touched, errors } = form
  return (
    <>
      <div className="field" style={style}>
        <label className="label" htmlFor={fieldName}>{label}</label>
        <div className="control">
          {component}
        </div>
      </div>
      {touched[fieldName] && errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
  )
}

export const TextField = (field) => {
  const { form, fieldName, type='input', className } = field
  const { handleChange, handleBlur, values } = form
  return (
    <FieldProvider
      field={field}
      component={
        <input
          id={fieldName}
          name={fieldName}
          type={type}
          className={`input ${className}`}
          onChange={handleChange}
          onBlur={handleBlur}
          value={values[fieldName]}
        />
      }
    />
  )
}

export const TextArea = (field) => {
  const { form, fieldName, type='input', className, placeholder } = field
  const { handleChange, handleBlur, values } = form
  return (
    <FieldProvider
      field={field}
      component={
        <textarea
          id={fieldName}
          name={fieldName}
          type={type}
          className={`input ${className}`}
          onChange={handleChange}
          onBlur={handleBlur}
          value={values[fieldName]}
          placeholder={placeholder}
        />
      }
    />
  )
}

export const RadioButton = (field) => {
  const { form, label, onChange, className, style, id } = field
  const { handleChange } = form
  return (
    <div className="control" style={style}>
      <label className={className}>
        <input
          name={id}
          type="radio"
          onChange={onChange ? onChange : handleChange}
        /> {label}
      </label>
    </div>
  )
}

export const CheckBox = (field) => {
  const { form, label, fieldName, onChange, className, style, index } = field
  const { handleChange, values, touched, errors } = form
  return (
    <>
      <div className="control" style={style}>
        <label className={className}>
          <input
            type="checkbox"
            name={fieldName}
            checked = {typeof index === 'number' ?
              index !== undefined ? values[fieldName][index] : values[fieldName]
              : index !== null ? true : false }
            onChange={onChange ? onChange : handleChange}
          /> {label}
        </label>
      </div>
      {touched[fieldName] && errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
  )
}