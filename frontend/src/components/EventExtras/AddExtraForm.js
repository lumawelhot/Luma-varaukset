import { Field, Formik } from 'formik'
import React from 'react'
import { ScienceClasses } from '../EventForm/FormComponents'
import { TextField } from '../VisitForm/FormFields'

const AddExtraForm = ({ handleAdd }) => {
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
              label='Lisäpalvelun nimi'
              fieldName='name'
              style={{ width: 300 }}
              component={TextField}
            />
            <ScienceClasses
              values={values}
              setFieldValue={setFieldValue}
              touched={touched}
              errors={errors}
            />
            <div className="control" style={{ marginTop: 7 }}>
              <button className="button luma primary" type='submit' onClick={handleSubmit}>Submit</button>
            </div>
          </>
        )
      }}
    </Formik>
  )
}

export default AddExtraForm