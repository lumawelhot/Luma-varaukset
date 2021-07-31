import { Field, Formik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScienceClasses } from '../EventForm/FormComponents'
import { TextField } from '../VisitForm/FormFields'

const AddExtraForm = ({ handleAdd }) => {
  const { t } = useTranslation('common')
  const submit = ({ name, scienceClass, remoteLength, inPersonLength }) => {
    const classes = []
    scienceClass.forEach((item, index) => item ? classes.push(index + 1) : null)
    handleAdd({
      name,
      classes,
      remoteLength: Number(remoteLength),
      inPersonLength: Number(inPersonLength)
    })
  }

  return (
    <Formik
      initialValues={{
        name: '',
        scienceClass: [true, true, true, true , true],
        inPersonLength: 10,
        remoteLength: 10
      }}
      onSubmit={submit}
    >
      {({ handleSubmit, values, touched, errors, setFieldValue }) => {
        return (
          <>
            <Field
              label={t('extra-name')}
              fieldName='name'
              style={{ width: 300 }}
              component={TextField}
            />
            <Field
              label={t('extra-duration-on-premises')}
              fieldName='inPersonLength'
              type='number'
              style={{ width: 300 }}
              component={TextField}
            />
            <Field
              label={t('extra-duration-remote')}
              fieldName='remoteLength'
              type='number'
              style={{ width: 300 }}
              component={TextField}
            />
            <ScienceClasses
              label={t('extra-resource')}
              values={values}
              setFieldValue={setFieldValue}
              touched={touched}
              errors={errors}
            />
            <div className="control" style={{ marginTop: 7 }}>
              <button className="button luma primary" type='submit' onClick={handleSubmit}>{t('submit')}</button>
            </div>
          </>
        )
      }}
    </Formik>
  )
}

export default AddExtraForm