import React from 'react'
import { Field } from 'formik'
import { CustomFormCheckBox, CustomFormRadioButton, TextField } from './FormFields'

const RenderCustomFormField = ({ field, fieldName }) => {

  if (field.type === 'text') return <Field component={TextField} label={field.name} fieldName={fieldName}/>
  if (field.type === 'radio') return (
    <div className="field">
      <label className="label">{field.name}</label>
      {field.options.map((o,index) =>
        <Field
          key={index}
          id={fieldName}
          label={o.text}
          value={o.value}
          component={CustomFormRadioButton}
        />)}
    </div>
  )
  if (field.type === 'checkbox') return (
    <div className="field">
      <label className="label">{field.name}</label>
      {field.options.map((o,index) =>
        <Field
          key={index}
          fieldName={fieldName}
          label={o.text}
          value={o.value}
          index={index}
          component={CustomFormCheckBox}
        />)}
    </div>
  )
}

const CustomForm = ({ customFormFields }) => {

  return (
    <>
      {customFormFields.map((field,index) =>
        <RenderCustomFormField key={index} field={field} fieldName={'custom-' + index}/>
      )}
    </>
  )
}

export default CustomForm