import React from 'react'
import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { GET_FORM } from '../../graphql/queries'
import { Field } from 'formik'
import { CheckBox, RadioButton, TextField } from './FormFields'

const RenderCustomFormField = ({ field, fieldName }) => {
  if (field.type === 'text') return <Field component={TextField} label={field.name} fieldName={fieldName} />
  if (field.type === 'radio') return (
    <div className="field">
      <label className="label">{field.name}</label>
      {field.options.map((o,index) =>
        <Field
          key={index}
          name={fieldName}
          label={o.text}
          component={RadioButton}
        />)}
    </div>
  )
  if (field.type === 'checkbox') return (
    <div className="field">
      <label className="label">{field.name}</label>
      {field.options.map((o,index) =>
        <Field
          key={index}
          name={fieldName}
          label={o.text}
          component={CheckBox}
        />)}
    </div>
  )
}

const CustomForm = ({ formid }) => {
  const { t } = useTranslation('common')

  const { loading, error, data } = useQuery(GET_FORM, {
    variables: { id: formid },
    onError: (error) => console.log('virheviesti: ', error),
  })

  if (loading) return <p className="notification">Searching form...</p>
  if (error) return <p className="notification">{t('error')}</p>

  const fields = JSON.parse(data.getForm.fields)

  return (
    <>
      {fields.map((field,index) =>
        <RenderCustomFormField key={index} field={field} fieldName={'custom-' + index}/>
      )}
    </>
  )
}

export default CustomForm