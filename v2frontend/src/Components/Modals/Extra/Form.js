/* eslint-disable react/display-name */
import React from 'react'
import { Formik } from 'formik'
import { Input } from '../../../Embeds/Input'
import { useTranslation } from 'react-i18next'
import { Stack } from 'react-bootstrap'
import { CheckboxGroup } from '@chakra-ui/react'
import { Checkbox } from '../../../Embeds/Button'
import { CLASSES } from '../../../config'
import Title, { Error } from '../../../Embeds/Title'
import { ExtraValidation } from '../../../helpers/validate'

const Form = React.forwardRef((props, ref) => {
  const { t } = useTranslation()

  return (
    <Formik
      innerRef={ref}
      initialValues={props.initialValues}
      validationSchema={ExtraValidation}
    >
      {({ handleChange, setFieldValue, handleBlur, values, errors, touched }) => (
        <>
          <Input
            id='name'
            title={t('extra-name')}
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.name}
          />
          {errors.name && touched.name && <Error>{t(errors.name)}</Error>}
          <Stack direction='horizontal'>
            <div style={{ width: '100%', marginRight: 15 }}>
              <Input
                id='inPersonLength'
                title={t('inperson-length')}
                onChange={handleChange}
                onBlur={handleBlur}
                type='number'
                value={values.inPersonLength}
              />
              {errors.inPersonLength && touched.inPersonLength && <Error>{t(errors.inPersonLength)}</Error>}
            </div>
            <div style={{ width: '100%' }}>
              <Input
                id='remoteLength'
                title={t('remote-length')}
                onBlur={handleBlur}
                onChange={handleChange}
                type='number'
                value={values.remoteLength}
              />
              {errors.remoteLength && touched.remoteLength && <Error>{t(errors.remoteLength)}</Error>}
            </div>
          </Stack>
          <CheckboxGroup defaultValue={values.classes} onChange={v => {
            setFieldValue('classes', v)
          }}>
            <Title>{t('extra-classes')}</Title>
            <Stack direction='col'>
              {CLASSES.map(c => (
                <Checkbox
                  key={c.value}
                  value={c.value.toString()}
                >{c.label}</Checkbox>
              ))}
            </Stack>
            {errors.classes && <Error>{t(errors.classes)}</Error>}
          </CheckboxGroup>
        </>
      )}
    </Formik>
  )
})

export default Form
