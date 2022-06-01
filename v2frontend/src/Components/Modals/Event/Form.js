/* eslint-disable react/display-name */
import { Button, CheckboxGroup } from '@chakra-ui/react'
import { format, set } from 'date-fns'
import { Formik } from 'formik'
import React, { useContext, useEffect, useMemo } from 'react'
import { Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { CLASSES, GRADES, LANG_MAP, MAX_TAG_FILTER_TAGS, PLATFORMS } from '../../../config'
import { Input, Select, TextArea } from '../../../Embeds/Input'
import { DatePicker, TimePicker } from '../../../Embeds/Picker'
import { Checkbox } from '../../../Embeds/Table'
import Title, { Error, required } from '../../../Embeds/Title'
import { MiscContext, FormContext, GroupContext } from '../../../services/contexts'
import _ from 'lodash'
import { someExist } from '../../../helpers/utils'
import Table from '../../Table'
import { eventDateColumns } from '../../../helpers/columns'
import { ButtonToolbar, IconButton } from 'rsuite'
import { DeleteIcon } from '@chakra-ui/icons'
import { EventValidation } from '../../../helpers/validate'

const Form = React.forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { dates, setDates } = props
  const { extras, tags, fetchTags, fetchExtras } = useContext(MiscContext)
  const { all: forms, fetch: fetchForms } = useContext(FormContext)
  const { all: groups, fetch: fetchGroups } = useContext(GroupContext)
  useEffect(fetchExtras, [])

  const updateDates = (values) => {
    const date = set(values.start, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 })
    let found = false
    dates.forEach(d => {
      if (new Date(d.date).getTime() === date.getTime()) found = true
    })
    if (!found) setDates(dates.concat({ date }))
  }

  useEffect(() => updateDates({ start: props.initialValues.start }), [])
  const eventColumns = useMemo(eventDateColumns, [])

  const dateData = useMemo(() => dates
    ?.map((f, i) => ({
      id: i,
      date: format(f.date, 'd.M.y'),
      optionButtons: <ButtonToolbar style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <IconButton onClick={() => {
          setDates(dates.filter((_, j) => j !== i))
        }} icon={<DeleteIcon color='red.500' />} />
      </ButtonToolbar>
    }))
  , [dates])

  return (
    <Formik
      innerRef={ref}
      validationSchema={EventValidation}
      initialValues={props.initialValues}
    >
      {({ handleChange, setFieldValue, handleBlur, values, errors, touched }) => (
        <div style={{ overflowX: 'hidden', padding: 3 }}>
          <Input
            id='title'
            onBlur={handleBlur}
            title={required(t('event-name'))}
            onChange={handleChange}
            value={values.title}
          />
          {errors.title && touched.title && <Error>{t(errors.title)}</Error>}
          <TextArea
            id='desc'
            title={t('description')}
            onChange={_.debounce(e => {
              setFieldValue('desc', e.target.value)
            }, 300, [setFieldValue])}
            defaultValue={values.desc}
          />
          {props.type === 'create' && <Input
            id='duration'
            title={required(t('event-length-minutes'))}
            onBlur={handleBlur}
            type='number'
            onChange={handleChange}
            value={values.duration}
          />}
          {errors.duration && touched.duration && <Error>{t(errors.duration)}</Error>}
          <Select
            title={t('tags')}
            max={MAX_TAG_FILTER_TAGS}
            onClick={fetchTags}
            value={values.tags}
            options={tags}
            onChange={v => setFieldValue('tags', v)}
          />
          <Title>{required(t('event-type'))}</Title>
          <Stack style={{ marginLeft: 3 }} direction='col'>
            <Checkbox
              isChecked={values.remoteVisit}
              onChange={v => setFieldValue('remoteVisit', v.target.checked)}
            >{t('remote-event')}</Checkbox>
            <Checkbox
              isChecked={values.inPersonVisit}
              onChange={v => setFieldValue('inPersonVisit', v.target.checked)}
            >{t('inperson-event')}</Checkbox>
          </Stack>
          {(errors.remoteVisit || errors.inPersonVisit) && <Error>{t(errors.remoteVisit)}</Error>}
          {values.remoteVisit && <CheckboxGroup value={values.remotePlatforms}
            onChange={e => setFieldValue('remotePlatforms', e)}>
            <Title>{required(t('remote-platforms'))}</Title>
            <Stack style={{ marginLeft: 3 }} direction='col'>
              {PLATFORMS.map((p, i) => <Checkbox
                key={i}
                value={`${i + 1}`}
              >
                {PLATFORMS[i]}
              </Checkbox>)}
              <Checkbox
                value={`${PLATFORMS.length + 1}`}
              >{t('other-what')}</Checkbox>
              {values.remotePlatforms.includes(`${PLATFORMS.length + 1}`) && <Input
                id='otherRemotePlatformOption'
                onChange={handleChange}
                value={values.otherRemotePlatformOption}
              />}
            </Stack>
          </CheckboxGroup>}
          <CheckboxGroup value={values.languages} onChange={v => {
            setFieldValue('languages', v)
          }}>
            <Title>{required(t('choose-languages'))}</Title>
            <Stack style={{ marginLeft: 3 }} direction='col'>
              {Object.keys(LANG_MAP).map(l => (
                <Checkbox
                  key={l}
                  value={l}
                >{LANG_MAP[l]}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          {errors.languages && <Error>{t(errors.languages)}</Error>}
          <CheckboxGroup value={values.grades} onChange={v => {
            setFieldValue('grades', v)
          }}>
            <Title>{required(t('choose-grades'))}</Title>
            <Stack style={{ marginLeft: 3 }} direction='col'>
              {GRADES.map(c => (
                <Checkbox
                  key={c.value}
                  value={c.value.toString()}
                >{c.label}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          {errors.grades && <Error>{t(errors.grades)}</Error>}
          <CheckboxGroup value={values.resourceids} onChange={v => {
            setFieldValue('extras', values.extras.filter(e => someExist(e, v.map(r => Number(r)))))
            setFieldValue('resourceids', v)
          }}>
            <Title>{required(t('choose-resources'))}</Title>
            <Stack direction='col'>
              {CLASSES.map(c => (
                <Checkbox
                  key={c.value}
                  value={c.value.toString()}
                >{c.label}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          {errors.resourceids && <Error>{t(errors.resourceids)}</Error>}
          <CheckboxGroup onChange={v => setFieldValue('extras', v)} value={values.extras}>
            <Title>{t('choose-extras')}</Title>
            <Stack direction='col'>
              {extras?.filter(e => someExist(e.classes, values.resourceids.map(v => Number(v))))
                .map((e, i) => <Checkbox key={i} value={e.id}>
                  {e.name}
                </Checkbox>)
              }
            </Stack>
          </CheckboxGroup>
          <Stack direction='horizontal'>
            {props.type === 'create' && <>
              <div style={{ width: '100%', marginRight: 15 }}>
                <DatePicker
                  value={values.start}
                  title={required(t('date'))}
                  onChange={v => {
                    const end = set(new Date(v), {
                      hours: values.end.getHours(), minutes: values.end.getMinutes()
                    })
                    setFieldValue('start', v)
                    setFieldValue('end', end)
                  }}
                />
              </div>
              <div style={{ marginTop: 40 }}>
                <Button height={9} colorScheme='blue' variant='outline' onClick={() => {
                  updateDates(values)
                }}>
                  {t('add-date')}
                </Button>
              </div>
            </>}
          </Stack>
          {props.type === 'create' && <Table data={dateData} columns={eventColumns} />}
          <Stack style={{ overflow: 'auto' }} direction='horizontal'>
            <div style={{ width: '100%', marginRight: 15 }}>
              <TimePicker
                value={values.start}
                hideHours={hour => hour < 8 || hour > 17}
                hideMinutes={minute => minute % 5 !== 0}
                title={required(t('start-time'))}
                onChange={v => setFieldValue('start', v)}
              />
              {errors.start && <Error>{t(errors.start)}</Error>}
            </div>
            <div style={{ width: '100%', marginRight: props.type === 'create' ? 15 : 0 }}>
              <TimePicker
                value={values.end}
                hideHours={hour => hour < 8 || hour > 17}
                hideMinutes={minute => minute % 5 !== 0}
                title={required(t('end-time'))}
                onChange={v => setFieldValue('end', v)}
              />
              {errors.end && <Error>{t(errors.end)}</Error>}
            </div>
            {props.type === 'create' && <div style={{ width: '100%', paddingRight: 2, paddingBottom: 2 }}>
              <Input
                id='waitingTime'
                title={required(t('waiting-time-visits'))}
                type='number'
                onChange={handleChange}
                value={values.waitingTime}
              />
              {errors.waitingTime && <Error>{t(errors.waitingTime)}</Error>}
            </div>}
          </Stack>
          <Select
            title={t('group')}
            onClick={fetchGroups}
            isMulti={false}
            value={values.group}
            options={groups?.map(g => ({
              value: g.id,
              label: g.name
            }))}
            onChange={v => setFieldValue('group', v)}
          />
          <Select
            title={t('custom-forms')}
            onClick={fetchForms}
            isMulti={false}
            value={values.customForm}
            options={forms?.map(f => ({
              value: f.id,
              label: f.name,
              fields: f.fields
            }))}
            onChange={v => setFieldValue('customForm', v)}
          />
          <Title>{t('publish-date')}</Title>
          <Stack direction='horizontal' style={{ overflow: 'auto', marginTop: -10 }}>
            <div style={{ width: '100%', marginRight: 15 }}>
              <DatePicker
                value={values.publishDate}
                onChange={e => {
                  if (!values.publishDate) setFieldValue('publishDate', set(e, { minutes: 0, hours: 0 }))
                  else setFieldValue('publishDate', e)
                }}
              />
            </div>
            <div style={{ width: '100%' }}>
              <TimePicker
                value={values.publishDate}
                onChange={e => setFieldValue('publishDate', e)}
              />
            </div>
          </Stack>
        </div>
      )}
    </Formik>
  )
})

export default Form