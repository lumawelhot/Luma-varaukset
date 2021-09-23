import { set } from 'date-fns'
import { Field } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import DatePicker from '../Pickers/DatePicker'
import TimePicker from '../Pickers/TimePicker'
import { CheckBox, TextField } from '../VisitForm/FormFields'
import { classes } from '../../helpers/classes'

const platformList = [
  { id: 0, label: 'Zoom' },
  { id: 1, label: 'Google Meet' },
  { id: 2, label: 'Microsoft Teams' },
  { id: 3, label: 'Muu, mikä?' }
]

const gradesList = [
  { id: 0, label: 'Varhaiskasvatus' },
  { id: 1, label: '1. - 2. luokka' },
  { id: 2, label: '3. - 6. luokka' },
  { id: 3, label: '7. - 9. luokka' },
  { id: 4, label: 'Toinen aste' }
]

export const EventType = () => {
  const { t } = useTranslation('visit')
  return (
    <>
      <label className="label" id="checkbox-group">
        {t('choose-remote-or-inperson')}
        <span style={{ color: 'red' }}> *</span>
      </label>
      <Field
        label={t('remote')}
        fieldName='remoteVisit'
        component={CheckBox}
      />
      <Field
        label={t('inperson')}
        fieldName='inPersonVisit'
        component={CheckBox}
      />
    </>
  )
}

export const Platforms = ({ values, touched, errors, setFieldValue }) => {
  const { t } = useTranslation('event')
  return (
    <>
      <div className="label" id="checkbox-group">
        {t('choose-remote-platforms')}
        <span style={{ color: 'red' }}> *</span>
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
  const { t } = useTranslation('event')
  return (
    <>
      <label className="label" id="checkbox-group">
        {t('choose-grades')}
        <span style={{ color: 'red' }}> *</span>
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
  const { t } = useTranslation('event')
  return (
    <>
      <label className="label" id="checkbox-group">
        {label ? label : t('choose-resources')}
        <span style={{ color: 'red' }}> *</span>
      </label>

      {classes.map((resource, i) => (
        <Field
          key={i}
          label={resource.label}
          fieldName='scienceClass'
          index={i}
          onChange={() => {
            touched.scienceClass = true
            values.scienceClass[i] = !values.scienceClass[i]
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
  const { t } = useTranslation('visit')
  return (
    <>
      {extras.data &&
        <>
          {extras.data.getExtras.some(extra => extra.classes.some(value => values.scienceClass[value - 1]) ? true : false) &&
            <label className="label">
              {t('choose-event-extras')}
            </label>
          }
          {extras.data.getExtras.map(extra => {
            const validExtras = extra.classes.some(value => values.scienceClass[value - 1])
            if (validExtras) {
              return (
                <Field
                  key={extra.id}
                  label={`${extra.name}, ${t('length-inperson')}: ${extra.inPersonLength} ${t('minutes-remote')}: ${extra.remoteLength} min`}
                  fieldName='extras'
                  index={values.extras.includes(extra.id) ? true : false}
                  onChange={() => {
                    if (values.extras.includes(extra.id)) {
                      setFieldValue('extras', values.extras.filter(e => e !== extra.id))
                    } else {
                      setFieldValue('extras', values.extras.concat(extra.id))
                    }
                  }}
                  component={CheckBox}
                />
              )
            }
          })}
        </>
      }
    </>
  )
}

export const TimePick = ({ form, fieldName, label, disabledHours }) => {
  const { touched, setFieldValue, values, errors } = form
  return (
    <div className="field">
      <label className="label" htmlFor="fieldName">
        {label}
        <span style={{ color: 'red' }}> *</span>
      </label>
      <div className="control">
        <TimePicker
          className={`input ${touched[fieldName]
            ? errors[fieldName]
              ? 'is-danger'
              : 'is-success'
            : ''
          }`}
          disabledHours={disabledHours}
          value={values[fieldName]}
          onChange={value => setFieldValue(fieldName, value)}
        />
      </div>
      {touched[fieldName] && errors[fieldName] ? (
        <p className="help is-danger">{errors[fieldName]}</p>
      ) : null}
    </div>
  )
}

export const DatePick = ({ form }) => {
  const { t } = useTranslation('event')
  const { touched, errors, setFieldValue, values } = form
  return (
    <div className="field">
      <label className="label" htmlFor="date">
        {t('date')}
        <span style={{ color: 'red' }}> *</span>
      </label>
      <div className="control">
        <DatePicker
          allowClear={false}
          className={`input ${touched.date
            ? errors.date
              ? 'is-danger'
              : 'is-success'
            : ''
          }`}
          format={'d.M.yyyy'}
          value={values.date}
          onChange={value => {
            const date = value.getDate()
            const month = value.getMonth()
            const year = value.getFullYear()
            const newStartTime = set(values.startTime, { year, month, date })
            const newEndTime = set(values.endTime, { year, month, date })
            setFieldValue('startTime', newStartTime)
            setFieldValue('endTime', newEndTime)
            setFieldValue('date', value)
          }}
        />
      </div>
      {touched.date && errors.date ? (
        <p className="help is-danger">{errors.date}</p>
      ) : null}
    </div>
  )
}

export const SelectField = ({ form, fieldName, label, options }) => {
  const { t } = useTranslation('event')
  const { setFieldValue, values } = form
  return (
    <div className="field">
      <label className="label" htmlFor="fieldName">
        {label}
      </label>
      <div className="control">
        <div className="select">
          <select
            value={values[fieldName]}
            onChange={event => setFieldValue(fieldName, event.target.value)}>
            <option value="">{t('no-custom-form')}</option>
            {options.map(o => <option key={o.id}value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}