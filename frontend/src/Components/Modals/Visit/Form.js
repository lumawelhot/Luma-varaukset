/* eslint-disable react/display-name */
import { RadioGroup, CheckboxGroup } from '@chakra-ui/react'
import { Formik } from 'formik'
import React, { useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Input } from '../../Embeds/Input'
import Title, { Error, required } from '../../Embeds/Title'
import { PLATFORMS } from '../../../config'
import { Checkbox, Radio } from '../../Embeds/Button'
import { TimePicker } from '../../Embeds/Picker'
import { add, format, set } from 'date-fns'
import { VisitValidation } from '../../../helpers/validate'
import { useEvents, useForms } from '../../../hooks/api'

const Form = React.forwardRef((props, ref) => {
  const { current: event } = useEvents()
  const { fetch } = useForms()
  const { t } = useTranslation()
  useEffect(() => {
    const exec = () => fetch()
    exec()
  }, [])

  const totalDuration = (values) => {
    if (!values.visitType) return event.duration
    const duration = event?.extras.reduce((sum, val) => {
      if (!values.extras.includes(val.id)) return sum
      const addition = values.visitType === 'remote'
        ? val.remoteLength : val.inPersonLength
      return sum + addition
    }, event.duration)
    return duration
  }

  if (!event) return <></>
  const form = event?.customForm

  return (
    <Formik
      innerRef={ref}
      validationSchema={VisitValidation}
      onSubmit={() => {}}
      initialValues={{
        clientName: '',
        schoolName: '',
        schoolLocation: '',
        clientEmail: '',
        verifyEmail: '',
        clientPhone: '',
        grade: '',
        participants: '',
        privacyPolicy: false,
        remoteVisitGuidelines: false,
        dataUseAgreement: false,
        language: event?.languages[0],
        otherRemotePlatformOption: '',
        extras: [],
        startTime: new Date(event.start),
        endTime: add(new Date(event.start), { minutes: event.duration }),
        visitType: event.inPersonVisit ? 'inperson' : 'remote',
        fields: [],
        customFormData: form?.fields?.map(f => {
          if (f.type === 'checkbox') return { name: f.name, value: [] }
          else return { name: f.name, value: '' }
        }),
        eventTimes: {
          start: new Date(event.start),
          end: new Date(event.end)
        }
      }}
    >
      {({ handleChange, setFieldValue, handleBlur, setFieldTouched, values, errors, touched }) => (
        <div className={props.show ? 'visible' : 'hidden'}>
          {event?.languages.length > 1 && (
            <RadioGroup onChange={v => setFieldValue('language', v)} value={values.language}>
              <Title>{t('language')}</Title>
              <Stack direction='col'>
                {event.languages.map((l, i) =>
                  <Radio key={i} value={l}>{t(l)}</Radio>
                )}
              </Stack>
            </RadioGroup>
          )}
          {event.inPersonVisit && event.remoteVisit ? (
            <RadioGroup onChange={v => {
              setFieldValue('visitType', v)
              const duration = totalDuration({ ...values, visitType: v })
              const endTime = add(set(new Date(values.startTime), { seconds: 0, milliseconds: 0 }), { minutes: duration })
              setFieldValue('endTime', endTime)
            }} value={values.visitType}>
              <Title>{required(t('choose-visit-type'))}</Title>
              <Stack direction='col'>
                <Radio value='remote'>{t('remote')}</Radio>
                <Radio value='inperson'>{t('inperson')}</Radio>
              </Stack>
            </RadioGroup>
          ) : null}
          {(values.visitType === 'remote' || (event.remoteVisit && !event.inPersonVisit)) &&
          <RadioGroup onChange={v => setFieldValue('remotePlatform', v)}>
            <Title>{required(t('choose-remote-platform'))}</Title>
            <Stack direction='col'>
              {/*
                NOTE, plantform functionality is not working well and should be reworked.
                Contains potential bugs that are hard to fix
              */}
              {event?.remotePlatforms
                .map((_, j) => PLATFORMS.map((p, i) => i + 1).includes(j + 1)
                  ? PLATFORMS[j] : event.otherRemotePlatformOption)
                .map((r, i) => <Radio key={i} value={`${i + 1}`}>{r}</Radio>)
              }
              <Radio value={`${event?.remotePlatforms.length + 1}`}>{t('other-what')}</Radio>
              {parseInt(values.remotePlatform) === event.remotePlatforms.length + 1 &&
                <Input
                  id='otherRemotePlatformOption'
                  onChange={handleChange}
                  value={values.otherRemotePlatformOption}
                />
              }
            </Stack>
          </RadioGroup>}
          <Input
            id='clientName'
            title={required(t('client-name'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.clientName}
          />
          {errors.clientName && touched.clientName && <Error>{t(errors.clientName)}</Error>}
          <Input
            id='schoolName'
            title={required(t('school-name'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.schoolName}
          />
          {errors.schoolName && touched.schoolName && <Error>{t(errors.schoolName)}</Error>}
          <Input
            id='schoolLocation'
            title={required(t('school-location'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.schoolLocation}
          />
          {errors.schoolLocation && touched.schoolLocation && <Error>{t(errors.schoolLocation)}</Error>}
          <Input
            id='clientEmail'
            title={required(t('client-email'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.clientEmail}
          />
          {errors.clientEmail && touched.clientEmail && <Error>{t(errors.clientEmail)}</Error>}
          <Input
            id='verifyEmail'
            title={required(t('verify-email'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.verifyEmail}
          />
          {errors.verifyEmail && touched.verifyEmail && <Error>{t(errors.verifyEmail)}</Error>}
          <Input
            id='clientPhone'
            title={required(t('client-phone'))}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.clientPhone}
          />
          {errors.clientPhone && touched.clientPhone && <Error>{t(errors.clientPhone)}</Error>}
          <Stack direction='horizontal'>
            <div style={{ width: '100%', marginRight: 15 }}>
              <Input
                id='grade'
                title={required(t('grade'))}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.grade}
              />
              {errors.grade && touched.grade && <Error>{t(errors.grade)}</Error>}
            </div>
            <div>
              <Input
                id='participants'
                type='number'
                title={required(t('participants'))}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.participants}
              />
              {errors.participants && touched.participants && <Error>{t(errors.participants)}</Error>}
            </div>
          </Stack>
          <CheckboxGroup onChange={v => {
            setFieldValue('extras', v)
            const duration = totalDuration({ ...values, extras: v })
            const endTime = add(set(new Date(values.startTime), { seconds: 0, milliseconds: 0 }), { minutes: duration })
            setFieldValue('endTime', endTime)
          }}>
            <Title>{t('chooose-extras')}</Title>
            <Stack direction='col'>
              {event?.extras
                .map(e => <Checkbox key={e.id} value={e.id} >
                  {`${e.name} (${t('length-inperson-min')} ${e.inPersonLength} ${t('length-remote-min')} ${e.remoteLength} ${t('min')})`}
                </Checkbox>)
              }
            </Stack>
          </CheckboxGroup>
          <Stack direction='col'>
            <Title>{required(`${t('start-and-timeslot')} ${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')})`)}</Title>
            <Stack direction='horizontal'>
              <TimePicker
                style={{ maxWidth: 200 }}
                value={values.startTime}
                hideHours={hour => hour < 8 || hour > 17}
                hideMinutes={minute => minute % 5 !== 0}
                onChange={async v => {
                  const startTime = set(new Date(v), { seconds: 0, milliseconds: 0 })
                  await setFieldValue('startTime', startTime)
                  const duration = totalDuration(values)
                  const endTime = add(set(new Date(v), { seconds: 0, milliseconds: 0 }), { minutes: duration })
                  setFieldValue('endTime', endTime)
                }}
              />
              <span style={{ fontSize: 15, marginTop: 8, marginLeft: 10 }}>{` – ${format(values.endTime, 'HH:mm')}`}</span>
            </Stack>
            {(errors.startTime || errors.endTime) && <Error>{t(errors.startTime ? errors.startTime : errors.endTime)}</Error>}
          </Stack>
          <Title />
          <Stack direction='col'>
            <Checkbox
              onChange={({ target }) => setFieldValue('privacyPolicy', target.checked)}
            >
              {required(<span>{t('accept-privacy-policy1')} <a className='default' href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit" target="_blank" rel="noreferrer">{t('privacy-policy')}</a> {t('accept-privacy-policy2')}</span>)}
            </Checkbox>
            {errors.privacyPolicy && touched.privacyPolicy && <Error>{t(errors.privacyPolicy)}</Error>}
            <Checkbox
              onChange={({ target }) => setFieldValue('dataUseAgreement', target.checked)}
            >
              {t('accept-data-use')}
            </Checkbox>
            <Checkbox
              onChange={({ target }) => setFieldValue('remoteVisitGuidelines', target.checked)}
            >
              {required(<span>{t('accept-instructions1')} <a className='default' href="https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet" target="_blank" rel="noreferrer">{t('instructions')}</a> {t('accept-instructions2')}</span>)}
            </Checkbox>
            {errors.remoteVisitGuidelines && touched.remoteVisitGuidelines && <Error>{t(errors.remoteVisitGuidelines)}</Error>}
          </Stack>
          {form?.fields && form?.fields?.map((field, j) => {
            const type = field.type
            const needed = field?.validation?.required
            return <div key={j}>
              <Title>{needed ? required(field.name) : field.name}</Title>
              {type === 'text' && <Input
                value={values?.customFormData[j].value}
                onBlur={() => setFieldTouched(`custom-${j}`)}
                onChange={e => {
                  const value = e.target.value
                  setFieldValue('customFormData',
                    values?.customFormData.map((c, i) => j === i ? { name: c.name, value } : c)
                  )
                }}
              />}
              {type === 'radio' && <RadioGroup onChange={v => {
                setFieldValue('customFormData',
                  values?.customFormData.map((c, i) => j === i ? { name: c.name, value: form.fields[j].options[Number(v)].text } : c)
                )
              }}>
                <Stack direction='col'>
                  {field.options.map((o, i) => <Radio
                    key={i}
                    onBlur={() => setFieldTouched(`custom-${j}`)}
                    value={o.value.toString()}
                  >{o.text}</Radio>)}
                </Stack>
              </RadioGroup>}
              {type === 'checkbox' && <CheckboxGroup onChange={v => {
                setFieldValue('customFormData',
                  values?.customFormData.map((c, i) => j === i ? { name: c.name, value: v
                    .map(o => form.fields[j].options[Number(o)].text)
                  } : c)
                )
              }}>
                <Stack direction='col'>
                  {field.options.map((o, i) => <Checkbox
                    key={i}
                    onBlur={() => setFieldTouched(`custom-${j}`)}
                    value={o.value.toString()}
                  >{o.text}</Checkbox>)}
                </Stack>
              </CheckboxGroup>}
              {needed && (touched[`custom-${j}`] || touched.customFormData) && values?.customFormData[j]?.value?.length <= 0 && <Error>{t('fill-field')}</Error>}
            </div>
          })}
        </div>
      )}
    </Formik>
  )
})

export default Form
