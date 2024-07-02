import React, { useEffect } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Input, Select, TimePicker } from '../../Embeds/Input'
import Title, { Error, required } from '../../Embeds/Title'
import { GRADES, PLATFORMS } from '../../../config'
import { Checkbox, Radio, RadioGroup, CheckboxGroup } from '../../Embeds/Button'
import { add, format, set } from 'date-fns'
import { VisitValidation } from '../../../helpers/validate'
import { visitInitialValues } from '../../../helpers/initialvalues'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { exec } from '../../../helpers/utils'
import { useForms } from '../../../hooks/cache'
import PropTypes from 'prop-types'

const Form = ({ formId, show, onSubmit, event, visit }) => {
  const { fetchAll } = useForms()
  const { t } = useTranslation()

  useEffect(exec(fetchAll), [])

  if (!event) return <></>
  const form = event?.customForm
  const grades = event?.grades

  const { control, register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
    resolver: !visit ? yupResolver(VisitValidation(form)) : undefined,
    defaultValues: visitInitialValues(event, visit),
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

  const showVisitTypes = (
    (event.inPersonVisit ? 1 : 0) +
    (event.remoteVisit ? 1 : 0) +
    (event.schoolVisit ? 1 : 0)
  ) > 1

  useEffect(() => {
    form?.fields && form?.fields?.forEach((field, j) => {
      const values = Object.fromEntries(getValues()?.customFormData?.map(f => [f.name, f.value]))
      setValue(`custom-${j}`, values[field.name])
    })
  }, [])

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className={show ? 'visible' : 'hidden'}>

      {event?.languages.length > 1 && (
        <RadioGroup name='language' control={control} title={t('language')} render={<>
          {event?.languages?.map((l, i) => <Radio key={i} value={l}>{t(l)}</Radio>)}
        </>}/>
      )}

      {showVisitTypes ? (
        <RadioGroup name= 'visitType' control={control} title={t('choose-visit-type')} onChange={() => {
          const duration = totalDuration()
          const endTime = add(set(new Date(watch('startTime')), { seconds: 0, milliseconds: 0 }), { minutes: duration })
          setValue('endTime', endTime)
        }} render={<>
          {event.remoteVisit && <Radio value='remote'>{t('remote')}</Radio>}
          {event.inPersonVisit && <Radio value='inperson'>{t('inperson')}</Radio>}
          {event.schoolVisit && <Radio value='school'>{t('school')}</Radio>}
        </>} />
      ) : null}
      {errors.visitType && <Error>{t(errors.visitType.message)}</Error>}

      {watch('visitType') === 'remote' &&
        <RadioGroup name='remotePlatform' title={required(t('choose-remote-platform'))} control={control} render={<>
          {event?.remotePlatforms
            .map(j => PLATFORMS.map((_, i) => i + 1).includes(j)
              ? [PLATFORMS[j - 1], j] : [event.otherRemotePlatformOption, j])
            .map(r => <Radio key={r[1]} value={`${r[0]}`}>{r[0]}</Radio>)
          }
          <Radio value={`${event?.remotePlatforms.length + 2}`}>{t('other-what')}</Radio>
          {parseInt(watch('remotePlatform')) === event.remotePlatforms.length + 2 &&
            <Input id='otherRemotePlatformOption' {...register('otherRemotePlatformOption')}/>
          }
          {errors.remotePlatform && <Error>{t('fill-field')}</Error>}
        </>
        }/>}

      {watch('visitType') === 'school' && <>
        <Input id='schoolAddress' title={required(t('school-address'))} {...register('schoolAddress')} />
        {errors.schoolAddress && <Error>{t('fill-field')}</Error>}
      </>}

      <Input id='clientName' title={required(t('client-name'))} {...register('clientName')} />
      {errors.clientName && <Error>{t(errors.clientName.message)}</Error>}

      <Input id='schoolName' title={required(t('school-name'))} {...register('schoolName')} />
      {errors.schoolName && <Error>{t(errors.schoolName.message)}</Error>}

      <Input id='schoolLocation' title={required(t('school-location'))} {...register('schoolLocation')} />
      {errors.schoolLocation && <Error>{t(errors.schoolLocation.message)}</Error>}

      <Input id='clientEmail' title={required(t('client-email'))} {...register('clientEmail')} />
      {errors.clientEmail && <Error>{t(errors.clientEmail.message)}</Error>}

      {!visit && <Input id='verifyEmail' title={required(t('verify-email'))} {...register('verifyEmail')} />}
      {errors.verifyEmail && <Error>{t(errors.verifyEmail.message)}</Error>}

      <Input id='clientPhone' title={required(t('client-phone'))} {...register('clientPhone')} />
      {errors.clientPhone && <Error>{t(errors.clientPhone.message)}</Error>}

      <Stack direction='horizontal'>
        <div style={{ width: '70%', marginRight: 15 }}>
          <Select
            title={required(t('grade'))}
            isMulti={false}
            value={watch('grade')}
            isClearable={false}
            menuPlacement='top'
            options={GRADES
              .filter(g => grades?.map(g => g.name)?.includes(g.label))
              .map(g => ({ ...g, label: t(g.label) }))
            }
            onChange={v => setValue('grade', v)}
          />
        </div>
        <div>
          <Input id='participants' type='number' title={required(t('participants'))} {...register('participants')} />
        </div>
      </Stack>
      {errors.grade && <Error>{t(errors.grade.message)}</Error>}
      {!errors.grade && errors.participants && <Error>{t('invalid-participants')}</Error>}

      <Input id='gradeInfo' title={t('grade-info')} {...register('gradeInfo')} />

      <CheckboxGroup name='extras' control={control} onChange={v => {
        const duration = totalDuration({ extras: v })
        const endTime = add(set(new Date(watch('startTime')), { seconds: 0, milliseconds: 0 }), { minutes: duration })
        setValue('endTime', endTime)
      }} render={<>
        {event?.extras?.length > 0 && <Title>{t('chooose-extras')}</Title>}
        {event?.extras?.map(e => <Checkbox key={e.id} value={e.id} >
          {`${e.name} (${t('length-inperson-min')} ${e.inPersonLength} ${t('length-remote-min')} ${e.remoteLength} ${t('min')})`}
        </Checkbox>)}
      </>} />

      {!visit && <Stack direction='col'>
        <Title>{required(`${t('start-and-timeslot')} ${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')})`)}</Title>
        <Stack direction='horizontal'>
          <TimePicker
            style={{ maxWidth: 200 }}
            {...register('startTime')}
            value={watch('startTime')}
            hideHours={hour => hour < 8 || hour > 17}
            hideMinutes={minute => minute % 5 !== 0}
            onChange={v => {
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
      </Stack>}

      <Title />
      <Stack direction='col'>
        {!visit && <Checkbox {...register('privacyPolicy')} >
          {required(<span>{t('accept-privacy-policy1')} <a
            className='default'
            href='https://www.helsinki.fi/fi/tiedekasvatus/tietoa-meista'
            target='_blank'
            rel='noreferrer'
          >{t('privacy-policy')}</a> {t('accept-privacy-policy2')}</span>)}
        </Checkbox>}
        {errors.privacyPolicy && <Error>{t(errors.privacyPolicy.message)}</Error>}
        {!visit && <Checkbox {...register('dataUseAgreement')} >
          {t('accept-data-use')}
        </Checkbox>}
        {!visit && <Checkbox {...register('remoteVisitGuidelines')} >
          {required(<span>{t('accept-instructions1')} <a
            className='default'
            href='https://www.helsinki.fi/fi/tiedekasvatus/opettajille-ja-opetuksen-tueksi/opintokaynnit-ja-lainattavat-tarvikkeet'
            target='_blank'
            rel='noreferrer'
          >{t('instructions')}</a> {t('accept-instructions2')}</span>)}
        </Checkbox>}
        {errors.remoteVisitGuidelines && <Error>{t(errors.remoteVisitGuidelines.message)}</Error>}
      </Stack>

      {form?.fields && form?.fields?.map((field, j) => {
        const { type } = field
        return <div key={j}>
          <Title>{field?.validation?.required ? required(field.name) : field.name}</Title>
          {type === 'text' && <Input id={j} {...register(`custom-${j}`)}/>}
          {type === 'radio' && <RadioGroup name={`custom-${j}`} control={control} render={<>
            {field.options.map((o, i) => <Radio key={i} value={o.text.toString()} >{o.text}</Radio>)}
          </>} />}
          {type === 'checkbox' && <CheckboxGroup name={`custom-${j}`} control={control} render={<>
            {field.options.map((o, i) => <Checkbox key={i} value={o.text.toString()} >{o.text}</Checkbox>)}
          </>} />}
          {errors[`custom-${j}`] && <Error>{t('fill-field')}</Error>}
        </div>
      })}
    </form>
  )
}

export default Form

Form.propTypes = {
  formId: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  event: PropTypes.object,
  visit: PropTypes.object
}
