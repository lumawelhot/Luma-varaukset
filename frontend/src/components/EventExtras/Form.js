import { Field, Formik } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScienceClasses } from '../EventForm/FormComponents'
import { TextField } from '../VisitForm/FormFields'

const Form = ({ handleAdd, handleModify, setModalState, modalState, extra, extraTitles }) => {
  const { t } = useTranslation('common')

  const validate = (values) => {
    const errors = {}
    if (extraTitles.includes(values.name)) {
      errors.name = t('extra-already-exists')
    }
    return errors
  }

  const submit = ({ name, scienceClass, remoteLength, inPersonLength }) => {
    const classes = []
    scienceClass.forEach((item, index) => item ? classes.push(index + 1) : null)
    const object = {
      name,
      classes,
      remoteLength: Number(remoteLength),
      inPersonLength: Number(inPersonLength),
    }
    if (modalState === 'add') handleAdd(object)
    else if (modalState === 'modify') handleModify(object)
  }

  const createResourceList = () => {
    const resources = [false, false, false, false , false]
    extra.classes.forEach(r => resources[r - 1] = true)
    return resources
  }

  return (
    <Formik
      initialValues={modalState === 'modify' ? {
        scienceClass: createResourceList(),
        name: extra.name,
        inPersonLength: extra.inPersonLength,
        remoteLength: extra.remoteLength
      } : {
        name: '',
        scienceClass: [true, true, true, true, true],
        inPersonLength: 10,
        remoteLength: 10
      }}
      onSubmit={submit}
      validate={validate}
    >
      {({ handleSubmit, values, touched, errors, setFieldValue }) => {
        return (
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">{modalState === 'modify' ? t('modify-extra') : t('create-extra')}</p>
            </header>
            <section className="modal-card-body">
              <>
                <Field
                  label={t('extra-name')}
                  fieldName='name'
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
              </>
            </section>
            <footer className="modal-card-foot">
              {Object.entries(errors).length ?
                <button className="button luma primary" type='submit' disabled>{t('submit')}</button>
                :
                <button className="button luma primary" type='submit' onClick={handleSubmit}>{t('submit')}</button>
              }
              <button className="button" onClick={() => setModalState(null)}>{t('close')}</button>
            </footer>
          </div>
        )
      }}
    </Formik>
  )
}

export default Form