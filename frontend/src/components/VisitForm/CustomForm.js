import React from 'react'
import { Field, useFormikContext } from 'formik'
import { CustomFormCheckBox, CustomFormRadioButton, TextField } from './FormFields'
import { useTranslation } from 'react-i18next'

const RenderCustomFormField = ({ field, fieldName }) => {
  const { errors } = useFormikContext()
  const { t } = useTranslation('event')

  const validateRequired = (value) => {
    if (!value) return t('is-required')
    if (value instanceof Array && !value.length) return (t('is-required'))
  }

  if (field.type === 'text') return (
    <>
      <label className="label">
        {field.name}
        {field.validation?.required ? <span style={{ color: 'red' }}> *</span> : null}
      </label>
      <Field
        validate={field.validation?.required ? validateRequired : null}
        component={TextField}
        name={fieldName}
        fieldName={fieldName}/>
    </>
  )
  if (field.type === 'radio') return (
    <>
      <div className="field">
        <label className="label">
          {field.name}
          {field.validation?.required ? <span style={{ color: 'red' }}> *</span> : null}
        </label>
        {field.options.map((o,index) =>
          <Field
            key={index}
            name={fieldName}
            fieldName={fieldName}
            validate={field.validation?.required ? validateRequired : null}
            label={o.text}
            value={o.value}
            component={CustomFormRadioButton}
          />)}
      </div>
      {errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
  )
  if (field.type === 'checkbox') return (
    <>
      <div className="field">
        <label className="label">
          {field.name}
          {field.validation?.required ? <span style={{ color: 'red' }}> *</span> : null}
        </label>
        {field.options.map((o,index) =>
          <Field
            key={index}
            validate={field.validation?.required ? validateRequired : null}
            fieldName={fieldName}
            name={fieldName}
            label={o.text}
            value={o.value}
            index={index}
            component={CustomFormCheckBox}
          />)}
      </div>
      {errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </>
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