import { Field } from 'formik'
import React from 'react'
import { CheckBox, TextField } from '../VisitForm/FormFields'

const platformList = [
  { id: 0, label: 'Zoom' },
  { id: 1, label: 'Google Meet' },
  { id: 2, label: 'Microsoft Teams' },
  { id: 3, label: 'Muu, mikä?' }
]

const gradesList = [
  { id: 0, label: 'Varhaiskasvatus' },
  { id: 1, label: '1.-2. luokka' },
  { id: 2, label: '3.-6. luokka' },
  { id: 3, label: '7.-9. luokka' },
  { id: 4, label: 'toinen aste' }
]

const resourceList = [
  { id: 0, label: 'SUMMAMUTIKKA' },
  { id: 1, label: 'FOTONI' },
  { id: 2, label: 'LINKKI' },
  { id: 3, label: 'GEOPISTE' },
  { id: 4, label: 'GADOLIN' }
]

export const EventType = () => {
  return (
    <>
      <label className="label" id="checkbox-group">
        Valitse etä- ja/tai lähivierailu
      </label>
      <Field
        label='Etävierailu'
        fieldName='remoteVisit'
        component={CheckBox}
      />
      <Field
        label='Lähivierailu'
        fieldName='inPersonVisit'
        component={CheckBox}
      />
    </>
  )
}

export const Platforms = ({ values, touched, errors, setFieldValue }) => {
  return (
    <>
      <div className="label" id="checkbox-group">
        Valitse etäyhteysalusta(t)
      </div>
      {platformList.map(platform => (
        <Field
          key={platform.label}
          label={platform.label}
          fieldName='remotePlatforms'
          index={platform.id}
          onChange={() => {
            touched.remotePlatforms = true
            values.remotePlatforms[platform.id] = !values.remotePlatforms[platform.id]
            setFieldValue('remotePlatforms', values.remotePlatforms)
          }}
          component={CheckBox}
        />
      ))}

      {values.remotePlatforms[3] ?
        <Field
          fieldName='otherRemotePlatformOption'
          component={TextField}
        /> : null
      }

      {touched.remotePlatforms && errors.remoteError ?
        <p className="help is-danger">{errors.remoteError}</p> : null
      }
    </>
  )
}

export const Grades = ({ values, touched, errors, setFieldValue }) => {
  return (
    <>
      <label className="label" id="checkbox-group">
        Valitse vierailulle sopivat luokka-asteet
      </label>

      {gradesList.map(grade => (
        <Field
          className='checkbox2'
          key={grade.label}
          label={grade.label}
          fieldName='grades'
          index={grade.id}
          onChange={() => {
            touched.grades = true
            values.grades[grade.id] = !values.grades[grade.id]
            setFieldValue('grades', values.grades)
          }}
          component={CheckBox}
        />
      ))}

      {touched.grades && errors.gradesError ?
        <p className="help is-danger">{errors.gradesError}</p> : null
      }
    </>
  )
}

export const ScienceClasses = ({ values, touched, errors, setFieldValue, label }) => {
  return (
    <>
      <label className="label" id="checkbox-group">
        {label ? label : 'Valitse vierailulle sopivat tiedeluokat'}
      </label>

      {resourceList.map(resource => (
        <Field
          key={resource.label}
          label={resource.label}
          fieldName='scienceClass'
          index={resource.id}
          onChange={() => {
            touched.scienceClass = true
            values.scienceClass[resource.id] = !values.scienceClass[resource.id]
            setFieldValue('scienceClass', values.scienceClass)
          }}
          component={CheckBox}
        />
      ))}

      {touched.scienceClass && errors.scienceClassError ?
        <p className="help is-danger">{errors.scienceClassError}</p> : null
      }
    </>
  )
}

export const AdditionalServices = ({ extras, values, setFieldValue }) => {
  return (
    <>
      <label className="label">
        Valitse vierailulle sopivat lisäpalvelut
      </label>
      {extras.data && extras.data.getExtras.map(extra => (
        <Field
          key={extra.id}
          label={`${extra.name}, pituus lähi: ${extra.inPersonLength} min / etä: ${extra.remoteLength} min`}
          fieldName='extras'
          index={values.extras.includes(extra.id) ? extra.id : null}
          onChange={() => {
            if (values.extras.includes(extra.id)) {
              setFieldValue('extras', values.extras.filter(e => e !== extra.id))
            } else {
              setFieldValue('extras', values.extras.concat(extra.id))
            }
          }}
          component={CheckBox}
        />
      ))
      }
    </>
  )
}