import { useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React from 'react'
import { EXTRAS } from '../../graphql/queries'
import { AdditionalServices, EventType, Grades, Platforms, ScienceClasses } from '../EventForm/FormComponents'
import { TextArea, TextField } from '../VisitForm/FormFields'

const Form = ({ event, close, save }) => {
  const extras = useQuery(EXTRAS)
  const createPlatformList = () => {
    const platforms = [false, false, false, false]
    event.remotePlatforms.forEach(platform => platforms[platform - 1] = true)
    return platforms
  }

  const createGradeList = () => {
    const grades = [false, false, false, false, false]
    event.grades.forEach(grade => grades[grade - 1] = true)
    return grades
  }

  const createResourceList = () => {
    const resources = [false, false, false, false , false]
    event.resourceids.forEach(resource => resources[resource - 1] = true)
    return resources
  }

  return (
    <Formik
      initialValues={{
        title: event.title,
        scienceClass: createResourceList(),
        grades: createGradeList(),
        remotePlatforms: createPlatformList(),
        otherRemotePlatformOption: event.otherRemotePlatformOption,
        desc: event.desc,
        inPersonVisit: event.inPersonVisit,
        remoteVisit: event.remoteVisit,
        extras: event.extras.map(extra => extra.id)
      }}
      onSubmit={save}
    >
      {({ handleSubmit, values, setFieldValue, touched, errors }) => {
        return (
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{values.title}</p>
              <button className="delete" aria-label="close" onClick={close}></button>
            </header>
            <section className="modal-card-body">
              <Field
                label='Vierailun nimi'
                fieldName='title'
                component={TextField}
              />
              <Field
                label='Kuvaus'
                fieldName='desc'
                component={TextArea}
              />
              <EventType />
              {values.remoteVisit ?
                <Platforms
                  values={values}
                  setFieldValue={setFieldValue}
                  touched={touched}
                  errors={errors}
                /> : null
              }
              <Grades
                values={values}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
              />
              <ScienceClasses
                values={values}
                setFieldValue={setFieldValue}
                touched={touched}
                errors={errors}
              />
              <AdditionalServices
                extras={extras}
                values={values}
                setFieldValue={setFieldValue}
              />
            </section>
            <footer className="modal-card-foot">
              <button className="button luma" type='submit' onClick={handleSubmit}>Tallenna</button>
              <button className="button" onClick={close}>Sulje</button>
            </footer>
          </div>
        )
      }}
    </Formik>
  )
}

export default Form