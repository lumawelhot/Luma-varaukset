/* eslint-disable react/display-name */
import { RadioGroup, CheckboxGroup } from '@chakra-ui/react'
import { Formik } from 'formik'
import React, { useContext, useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Input } from '../../../Embeds/Input'
import Title from '../../../Embeds/Title'
import { EventContext, FormContext } from '../../../services/contexts'
import { PLATFORMS } from '../../../config'
import { Checkbox, Radio } from '../../../Embeds/Button'
import { TimePicker } from '../../../Embeds/Picker'
import { add, format, set } from 'date-fns'
import { visitValidate } from '../../../helpers/validate'

const Form = React.forwardRef((props, ref) => {
  const { current: event } = useContext(EventContext)
  const { fetch } = useContext(FormContext)
  const { t } = useTranslation()
  useEffect(fetch, [])

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
      validate={visitValidate}
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
        })
      }}
    >
      {({ handleChange, setFieldValue, values }) => (
        <div className={props.show ? 'visible' : 'hidden'}>
          {event?.languages.length > 1 && (
            <RadioGroup onChange={v => setFieldValue('language', v)} value={values.language}>
              <Title>{t('language')}</Title>
              <Stack direction='col'>
                {event.languages.map((l, i) =>
                  <Radio key={i} value={l}>{l}</Radio>
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
              <Title>{t('choose-visit-type')}</Title>
              <Stack direction='col'>
                <Radio value='remote'>{t('remote')}</Radio>
                <Radio value='inperson'>{t('inperson')}</Radio>
              </Stack>
            </RadioGroup>
          ) : null}
          {(values.visitType === 'remote' || (event.remoteVisit && !event.inPersonVisit)) &&
          <RadioGroup onChange={v => setFieldValue('remotePlatform', v)}>
            <Title>{t('choose-remote-platform')}</Title>
            <Stack direction='col'>
              {event?.remotePlatforms
                .map(r => PLATFORMS.map((p, i) => i + 1).includes(r)
                  ? PLATFORMS[r - 1] : event.otherRemotePlatformOption)
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
            title={t('client-name')}
            onChange={handleChange}
            value={values.clientName}
          />
          <Input
            id='schoolName'
            title={t('school-name')}
            onChange={handleChange}
            value={values.schoolName}
          />
          <Input
            id='schoolLocation'
            title={t('school-location')}
            onChange={handleChange}
            value={values.schoolLocation}
          />
          <Input
            id='clientEmail'
            title={t('client-email')}
            onChange={handleChange}
            value={values.clientEmail}
          />
          <Input
            id='verifyEmail'
            title={t('verify-email')}
            onChange={handleChange}
            value={values.verifyEmail}
          />
          <Input
            id='clientPhone'
            title={t('client-phone')}
            onChange={handleChange}
            value={values.clientPhone}
          />
          <Stack direction='horizontal'>
            <div style={{ width: '100%', marginRight: 15 }}>
              <Input
                id='grade'
                title={t('grade')}
                onChange={handleChange}
                value={values.grade}
              />
            </div>
            <div>
              <Input
                id='participants'
                type='number'
                title={t('participants')}
                onChange={handleChange}
                value={values.participants}
              />
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
            <Title>{`${t('start-and-timeslot')} ${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')})`}</Title>
            <Stack direction='horizontal'>
              <TimePicker
                style={{ maxWidth: 200 }}
                value={values.startTime}
                hideHours={hour => hour < 8 || hour > 17}
                hideMinutes={minute => minute % 5 !== 0}
                onChange={v => {
                  const startTime = set(new Date(v), { seconds: 0, milliseconds: 0 })
                  setFieldValue('startTime', startTime)
                  const duration = totalDuration(values)
                  const endTime = add(set(new Date(v), { seconds: 0, milliseconds: 0 }), { minutes: duration })
                  setFieldValue('endTime', endTime)
                }}
              />
              <span style={{ fontSize: 15, marginTop: 8, marginLeft: 10 }}>{` – ${format(values.endTime, 'HH:mm')}`}</span>
            </Stack>
          </Stack>
          <Title />
          <Stack direction='col'>
            <Checkbox
              onChange={({ target }) => setFieldValue('privacyPolicy', target.checked)}
            >
              {t('accept-privacy-policy1')} <a className='default' href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit" target="_blank" rel="noreferrer">{t('privacy-policy')}</a> {t('accept-privacy-policy2')}
            </Checkbox>
            <Checkbox
              onChange={({ target }) => setFieldValue('dataUseAgreement', target.checked)}
            >
              {t('accept-data-use')}
            </Checkbox>
            <Checkbox
              onChange={({ target }) => setFieldValue('remoteVisitGuidelines', target.checked)}
            >
              {t('accept-instructions1')} <a className='default' href="https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet" target="_blank" rel="noreferrer">{t('instructions')}</a> {t('accept-instructions2')}
            </Checkbox>
          </Stack>
          {form?.fields && form?.fields?.map((field, j) => {
            const type = field.type
            return <div key={j}>
              <Title>{field.name}</Title>
              {type === 'text' && <Input
                value={values?.customFormData[j].value}
                onChange={e => {
                  setFieldValue('customFormData',
                    values?.customFormData.map((c, i) => j === i ? { name: c.name, value: e.target.value } : c)
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
                    value={o.value.toString()}
                  >{o.text}</Checkbox>)}
                </Stack>
              </CheckboxGroup>}
            </div>
          })}
        </div>
      )}
    </Formik>
  )
})

export default Form
