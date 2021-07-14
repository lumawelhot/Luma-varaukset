import { useQuery } from '@apollo/client'
import { Field, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { EXTRAS, TAGS } from '../../graphql/queries'
import { AdditionalServices, EventType, Grades, Platforms, ScienceClasses, TimePick } from '../EventForm/FormComponents'
import LumaTagInput from '../LumaTagInput/LumaTagInput'
import { TextArea, TextField } from '../VisitForm/FormFields'

const Form = ({ event, close, save }) => {
  const [suggestedTags, setSuggestedTags] = useState([])
  const tags = useQuery(TAGS)
  const extras = useQuery(EXTRAS)

  useEffect(() => {
    if (tags.data) setSuggestedTags(tags.data.getTags.map(tag => tag.name))
  }, [tags.data])

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

  console.log(event)

  return (
    <Formik
      initialValues={{
        title: event.title,
        scienceClass: createResourceList(),
        grades: createGradeList(),
        remotePlatforms: createPlatformList(),
        otherRemotePlatformOption: event.otherRemotePlatformOption,
        desc: event.desc ? event.desc : '',
        inPersonVisit: event.inPersonVisit,
        remoteVisit: event.remoteVisit,
        extras: event.extras.map(extra => extra.id),
        tags: event.tags.map(tag => tag.name),
        startTime: new Date(event.eventStart),
        endTime: new Date(event.eventEnd)
      }}
      onSubmit={(values) => save(values, tags)}
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
              <LumaTagInput
                label="Tagit"
                tags={values.tags}
                setTags={tags => setFieldValue('tags', tags)}
                suggestedTags={suggestedTags}
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
              <Field
                label='Aloituskellonaika'
                fieldName='startTime'
                component={TimePick}
              />

              <Field
                label='Lopetuskellonaika'
                fieldName='endTime'
                component={TimePick}
                disabledHours={() => [0,1,2,3,4,5,6,7,18,19,20,21,22,23]}
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