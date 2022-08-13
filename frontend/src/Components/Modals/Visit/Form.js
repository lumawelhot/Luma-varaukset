import React, { useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Input } from '../../Embeds/Input'
import Title, { Error, required } from '../../Embeds/Title'
import { PLATFORMS } from '../../../config'
import { Checkbox, Radio, _RadioGroup, _CheckboxGroup } from '../../Embeds/Button'
import { TimePicker } from '../../Embeds/Picker'
import { add, format, set } from 'date-fns'
import { VisitValidation } from '../../../helpers/validate'
import { useEvents, useForms } from '../../../hooks/api'
import { visitInitialValues } from '../../../helpers/initialvalues'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

const Form = ({ formId, show, onSubmit }) => {
  const { current: event } = useEvents()
  const { fetch } = useForms()
  const { t } = useTranslation()

  useEffect(() => {
    const exec = () => fetch()
    exec()
  }, [])

  if (!event) return <></>
  const form = event?.customForm

  const { control, register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
    resolver: yupResolver(VisitValidation(form)),
    defaultValues: visitInitialValues(event),
    mode: 'onTouched'
  })


  const totalDuration = (args) => {
    const values = { ...getValues(), ...args }
    if (!values.visitType) return event.duration
    const duration = event?.extras.reduce((sum, val) => {
      if (!values.extras.includes(val.id)) return sum
      const addition = values.visitType === 'remote'
        ? val.remoteLength : val.inPersonLength
      return sum + addition
    }, event.duration)
    return duration
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className={show ? 'visible' : 'hidden'}>

      {event?.languages.length > 1 && (
        <_RadioGroup name='language' control={control} title={t('language')} render={<>
          {event.languages.map((l, i) => <Radio key={i} value={l}>{t(l)}</Radio>)}
        </>}/>
      )}

      {event.inPersonVisit && event.remoteVisit ? (
        <_RadioGroup name= 'visitType' control={control} title={t('choose-visit-type')} onChange={() => {
          const duration = totalDuration()
          const endTime = add(set(new Date(watch('startTime')), { seconds: 0, milliseconds: 0 }), { minutes: duration })
          setValue('endTime', endTime)
        }} render={<>
          <Radio value='remote'>{t('remote')}</Radio>
          <Radio value='inperson'>{t('inperson')}</Radio>
        </>} />
      ) : null}

      {(watch('visitType') === 'remote' || (event.remoteVisit && !event.inPersonVisit)) &&
      <_RadioGroup name='remotePlatform' title={required(t('choose-remote-platform'))} control={control} render={<>
        {event?.remotePlatforms
          .map((_, j) => PLATFORMS.map((_, i) => i + 1).includes(j + 1)
            ? PLATFORMS[j] : event.otherRemotePlatformOption)
          .map((r, i) => <Radio key={i} value={`${i + 1}`}>{r}</Radio>)
        }
        <Radio value={`${event?.remotePlatforms.length + 1}`}>{t('other-what')}</Radio>
        {parseInt(watch('remotePlatform')) === event.remotePlatforms.length + 1 &&
          <Input id='otherRemotePlatformOption' {...register('otherRemotePlatformOption')}/>
        }</>
      }/>}
      {errors.remotePlatform && <Error>{t(errors.remotePlatform.message)}</Error>}

      <Input id='clientName' title={required(t('client-name'))} {...register('clientName')} />
      {errors.clientName && <Error>{t(errors.clientName.message)}</Error>}

      <Input id='schoolName' title={required(t('school-name'))} {...register('schoolName')} />
      {errors.schoolName && <Error>{t(errors.schoolName.message)}</Error>}

      <Input id='schoolLocation' title={required(t('school-location'))} {...register('schoolLocation')} />
      {errors.schoolLocation && <Error>{t(errors.schoolLocation.message)}</Error>}

      <Input id='clientEmail' title={required(t('client-email'))} {...register('clientEmail')} />
      {errors.clientEmail && <Error>{t(errors.clientEmail.message)}</Error>}

      <Input id='verifyEmail' title={required(t('verify-email'))} {...register('verifyEmail')} />
      {errors.verifyEmail && <Error>{t(errors.verifyEmail.message)}</Error>}

      <Input id='clientPhone' title={required(t('client-phone'))} {...register('clientPhone')} />
      {errors.clientPhone && <Error>{t(errors.clientPhone.message)}</Error>}

      <Stack direction='horizontal'>
        <div style={{ width: '100%', marginRight: 15 }}>
          <Input id='grade' title={required(t('grade'))} {...register('grade')} />
          {errors.grade && <Error>{t(errors.grade.message)}</Error>}
        </div>
        <div>
          <Input id='participants' type='number' title={required(t('participants'))} {...register('participants')} />
          {errors.participants && <Error>{t(errors.participants.message)}</Error>}
        </div>
      </Stack>

      <_CheckboxGroup name='extras' control={control} onChange={v => {
        const duration = totalDuration({ extras: v })
        const endTime = add(set(new Date(watch('startTime')), { seconds: 0, milliseconds: 0 }), { minutes: duration })
        setValue('endTime', endTime)
      }} render={<>
        {event?.extras?.length > 0 && <Title>{t('chooose-extras')}</Title>}
        {event?.extras.map(e => <Checkbox key={e.id} value={e.id} >
          {`${e.name} (${t('length-inperson-min')} ${e.inPersonLength} ${t('length-remote-min')} ${e.remoteLength} ${t('min')})`}
        </Checkbox>)}
      </>} />

      <Stack direction='col'>
        <Title>{required(`${t('start-and-timeslot')} ${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')})`)}</Title>
        <Stack direction='horizontal'>
          <TimePicker
            style={{ maxWidth: 200 }}
            {...register('startTime')}
            value={watch('startTime')}
            hideHours={hour => hour < 8 || hour > 17}
            hideMinutes={minute => minute % 5 !== 0}
            onChange={async v => {
              const startTime = set(new Date(v), { seconds: 0, milliseconds: 0 })
              setValue('startTime', startTime)
              const duration = totalDuration()
              const endTime = add(set(new Date(v), { seconds: 0, milliseconds: 0 }), { minutes: duration })
              setValue('endTime', endTime)
            }}
          />
          <span style={{ fontSize: 15, marginTop: 8, marginLeft: 10 }}>{` – ${format(watch('endTime'), 'HH:mm')}`}</span>
        </Stack>
        {(errors.startTime) && <Error>{t(errors.startTime.message)}</Error>}
      </Stack>

      <Title />
      <Stack direction='col'>
        <Checkbox {...register('privacyPolicy')} >
          {required(<span>{t('accept-privacy-policy1')} <a
            className='default'
            href="https://www2.helsinki.fi/fi/tiedekasvatus/tietosuojailmoitus-opintokaynnit"
            target="_blank"
            rel="noreferrer"
          >{t('privacy-policy')}</a> {t('accept-privacy-policy2')}</span>)}
        </Checkbox>
        {errors.privacyPolicy && <Error>{t(errors.privacyPolicy.message)}</Error>}
        <Checkbox {...register('dataUseAgreement')} >
          {t('accept-data-use')}
        </Checkbox>
        <Checkbox {...register('remoteVisitGuidelines')} >
          {required(<span>{t('accept-instructions1')} <a
            className='default'
            href="https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet"
            target="_blank"
            rel="noreferrer"
          >{t('instructions')}</a> {t('accept-instructions2')}</span>)}
        </Checkbox>
        {errors.remoteVisitGuidelines && <Error>{t(errors.remoteVisitGuidelines.message)}</Error>}
      </Stack>

      {form?.fields && form?.fields?.map((field, j) => {
        const type = field.type
        return <div key={j}>
          <Title>{field?.validation?.required ? required(field.name) : field.name}</Title>
          {type === 'text' && <Input id={j} {...register(`custom-${j}`)}/>}
          {type === 'radio' && <_RadioGroup name={`custom-${j}`} control={control} render={<>
            {field.options.map((o, i) => <Radio key={i} value={o.text.toString()} >{o.text}</Radio>)}
          </>}/>}
          {type === 'checkbox' && <_CheckboxGroup name={`custom-${j}`} control={control} render={<>
            {field.options.map((o, i) => <Checkbox key={i} value={o.text.toString()} >{o.text}</Checkbox>)}
          </>} />}
          {errors[`custom-${j}`] && <Error>{t('fill-field')}</Error>}
        </div>
      })}
    </form>
  )
}

export default Form