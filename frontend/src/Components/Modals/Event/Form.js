import { Button } from '@chakra-ui/react'
import { format, set } from 'date-fns'
import React, { useEffect, useMemo } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { CLASSES, GRADES, LANG_MAP, MAX_TAG_FILTER_TAGS, PLATFORMS } from '../../../config'
import { Input, Select, TextArea, DatePicker, TimePicker } from '../../Embeds/Input'
import { Checkbox } from '../../Embeds/Table'
import Title, { Error, required } from '../../Embeds/Title'
import { IconButton, CheckboxGroup } from '../../Embeds/Button'
import { exec, someExist } from '../../../helpers/utils'
import Table from '../../Table'
import { eventDateColumns } from '../../../helpers/columns'
import { DeleteIcon } from '@chakra-ui/icons'
import { EventValidation } from '../../../helpers/validate'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useExtras, useForms, useGroups, useMisc } from '../../../hooks/cache'

const Form = ({ formId, onSubmit, initialValues, type }) => {
  const { t } = useTranslation()
  const { all: extras, fetchAll: fetchExtras } = useExtras()
  const { tags, fetchTags } = useMisc()
  const { all: forms, fetchAll: fetchForms } = useForms()
  const { all: groups, fetchAll: fetchGroups } = useGroups()
  useEffect(exec(fetchExtras), [])

  const { control, register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
    resolver: yupResolver(EventValidation),
    defaultValues: { ...initialValues, dates: [] },
    mode: 'onTouched'
  })

  const updateDates = (values) => {
    const date = set(values.start, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })
    let found = false
    watch('dates').forEach(d => {
      if (new Date(d.date).getTime() === date.getTime()) found = true
    })
    if (!found) setValue('dates', watch('dates').concat({ date }))
  }

  useEffect(() => updateDates({ start: initialValues.start }), [])
  const eventColumns = useMemo(eventDateColumns, [])

  const dateData = useMemo(() => watch('dates')
    ?.map((f, i) => ({
      id: i,
      date: format(f.date, 'd.M.y'),
      optionButtons: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <IconButton size='sm' onClick={() => {
          setValue('dates', watch('dates').filter((_, j) => j !== i))
        }} icon={<DeleteIcon color='red.500' />} />
      </div>
    }))
  , [watch('dates')])

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} style={{ overflowX: 'hidden', padding: 3 }}>

      <Input id='title' title={required(t('event-name'))} {...register('title')} />
      {errors.title && <Error>{t(errors.title.message)}</Error>}

      <TextArea id='desc' title={t('description')} {...register('desc')}/>

      {type === 'create' && (
        <Input id='duration' title={required(t('event-length-minutes'))} type='number' {...register('duration')} />)}
      {errors.duration && <Error>{t(errors.duration.message)}</Error>}

      <Select
        title={t('tags')}
        max={MAX_TAG_FILTER_TAGS}
        onClick={fetchTags}
        value={watch('tags')}
        options={tags}
        onChange={v => setValue('tags', v)}
        creatable
      />

      <Title>{required(t('event-type'))}</Title>
      <Stack style={{ marginLeft: 3 }} direction='col'>
        <Checkbox {...register('remoteVisit')}>{t('remote-event')}</Checkbox>
        <Checkbox {...register('inPersonVisit')}>{t('inperson-event')}</Checkbox>
      </Stack>
      {(errors.remoteVisit || errors.inPersonVisit) && (
        <Error>{t(errors.remoteVisit ? errors.remoteVisit.message : errors.inPersonVisit.message)}</Error>
      )}

      {watch('remoteVisit') && (
        <CheckboxGroup name='remotePlatforms' title={required(t('remote-platforms'))} control={control} render={<>
          {PLATFORMS.map((_, i) => <Checkbox key={i} value={`${i + 1}`}>{PLATFORMS[i]}</Checkbox>)}
          <Checkbox value={`${PLATFORMS.length + 1}`}>{t('other-what')}</Checkbox>
          {watch('remotePlatforms').includes(`${PLATFORMS.length + 1}`) && (
            <Input id='otherRemotePlatformOption' {...register('otherRemotePlatformOption')} />
          )}
          {errors.remotePlatforms && <Error>{t(errors.remotePlatforms.message)}</Error>}
        </>}/>
      )}

      <CheckboxGroup name='languages' title={required(t('choose-languages'))} control={control} render={<>
        {Object.keys(LANG_MAP).map(l => (
          <Checkbox key={l} value={l}>{t(LANG_MAP[l])}</Checkbox>
        ))}
      </>} />
      {errors.languages && <Error>{t(errors.languages.message)}</Error>}

      <CheckboxGroup name='grades' title={required(t('choose-grades'))} control={control} render={<>
        {GRADES.map(c => (
          <Checkbox key={c.value} value={c.value.toString()}>{t(c.label)}</Checkbox>
        ))}
      </>}/>
      {errors.grades && <Error>{t(errors.grades.message)}</Error>}

      <CheckboxGroup name='resourceids' title={required(t('choose-resources'))} control={control} onChange={v => {
        setValue('extras', watch('extras').filter(e => someExist(e, v.map(r => Number(r)))))
      }} render={<>
        {CLASSES.map(c => (
          <Checkbox key={c.value} value={c.value.toString()} >{c.label}</Checkbox>
        ))}
      </>} />
      {errors.resourceids && <Error>{t(errors.resourceids.message)}</Error>}

      <CheckboxGroup name='extras' title={t('choose-extras')} control={control} render={<>
        {extras?.filter(e => someExist(e.classes, watch('resourceids').map(v => Number(v))))
          .map((e, i) => <Checkbox key={i} value={e.id}>{e.name}</Checkbox>)}
      </>} />

      <Stack direction='horizontal'>
        {type === 'create' && <>
          <div style={{ width: '100%', marginRight: 15 }}>
            <DatePicker
              value={watch('start')}
              title={required(t('date'))}
              onChange={v => {
                const end = set(new Date(v), { hours: watch('end').getHours(), minutes: watch('end').getMinutes() })
                setValue('start', v)
                setValue('end', end)
              }}
            />
          </div>
          <div style={{ marginTop: 40 }}>
            <Button height={9} colorScheme='blue' variant='outline' onClick={() => updateDates(getValues())}>
              {t('add-date')}
            </Button>
          </div>
        </>}
      </Stack>

      {type === 'create' && <Table data={dateData} columns={eventColumns} />}

      <Stack style={{ overflow: 'auto' }} direction='horizontal'>
        <div style={{ width: '100%', marginRight: 15 }}>
          <TimePicker
            value={watch('start')}
            hideHours={hour => hour < 8 || hour > 17}
            hideMinutes={minute => minute % 5 !== 0}
            title={required(t('start-time'))}
            onChange={v => setValue('start', v)}
          />
          {errors.start && <Error>{t(errors.start)}</Error>}
        </div>
        <div style={{ width: '100%', marginRight: type === 'create' ? 15 : 0 }}>
          <TimePicker
            value={watch('end')}
            hideHours={hour => hour < 8 || hour > 17}
            hideMinutes={minute => minute % 5 !== 0}
            title={required(t('end-time'))}
            onChange={v => setValue('end', v)}
          />
          {errors.end && <Error>{t(errors.end)}</Error>}
        </div>
        {type === 'create' && <div style={{ width: '100%', paddingRight: 2, paddingBottom: 2 }}>
          <Input id='waitingTime' title={required(t('waiting-time-visits'))} type='number' {...register('waitingTime')} />
          {errors.waitingTime && <Error>{t(errors.waitingTime)}</Error>}
        </div>}
      </Stack>
      <Select
        title={t('group')}
        onClick={fetchGroups}
        isMulti={false}
        value={watch('group')}
        menuPlacement='top'
        options={groups?.map(g => ({ value: g.id, label: g.name }))}
        onChange={v => setValue('group', v)}
      />
      <Select
        title={t('custom-forms')}
        onClick={fetchForms}
        isMulti={false}
        value={watch('customForm')}
        menuPlacement='top'
        options={forms?.map(f => ({ value: f.id, label: f.name, fields: f.fields }))}
        onChange={v => setValue('customForm', v)}
      />
      <Title>{t('publish-date')}</Title>
      <Stack direction='horizontal' style={{ overflow: 'auto', marginTop: -10 }}>
        <div style={{ width: '100%', marginRight: 15 }}>
          <DatePicker
            value={watch('publishDate')}
            onChange={e => setValue('publishDate', set(e, { minutes: 0, hours: 0 }))}
          />
        </div>
        <div style={{ width: '100%' }}>
          <TimePicker
            value={watch('publishDate')}
            onChange={e => setValue('publishDate', e)}
          />
        </div>
      </Stack>
    </form>
  )
}

export default Form
