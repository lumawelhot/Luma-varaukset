import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formFieldColumns } from '../../../helpers/columns'
import Table from '../../Table'
import { TriangleUpIcon, TriangleDownIcon, DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons'
import { Stack } from 'react-bootstrap'
import { RadioGroup } from '@chakra-ui/react'
import { Radio, IconButton } from '../../Embeds/Button'
import { Checkbox } from '../../Embeds/Table'
import Title, { Error, required } from '../../Embeds/Title'
import { yupResolver } from '@hookform/resolvers/yup'
import { CustomFormValidation } from '../../../helpers/validate'
import { useForm } from 'react-hook-form'
import { Input } from '../../Embeds/Input'
import { DEFAULT_FIELD_VALUES } from '../../../config'

const Form = (({ initialValues, setOnModify, onModify, onSubmit, formId }) => {
  const { t } = useTranslation()
  const [fields, setFields] = useState(initialValues.fields)
  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
    defaultValues: {
      name: initialValues.name,
      question: '',
      required: true,
      options: DEFAULT_FIELD_VALUES,
      type: 'text'
    },
    resolver: yupResolver(CustomFormValidation)
  })

  const move = (id, step) => {
    if (id + step < 0 || id + step > fields.length - 1) return
    const newFields = [...fields]
    const temp = newFields[id]
    newFields[id] = newFields[id + step]
    newFields[id + step] = temp
    setFields(newFields)
  }

  const handleRemoveField = id => setFields(fields.filter((_, i) => i !== id))
  const handleMoveUp = id => move(id, -1)
  const handleMoveDown = id => move(id, 1)
  const handleModify = id => {
    setOnModify({ ...fields[id], id })
    const { name, options, type, validation } = fields[id]
    setValue('question', name)
    setValue('options', options ? options.map(o => o.text) : DEFAULT_FIELD_VALUES)
    setValue('required', validation.required)
    setValue('type', type)
  }

  const fieldData = useMemo(() => fields
    ?.map((f, i) => ({
      id: i,
      name: f.name,
      required: f.validation.required ? t('yes') : t('no'),
      type: t(f.type),
      optionButtons: <div style={{ whiteSpace: 'nowrap' }}>
        <IconButton
          size='sm'
          colorScheme={onModify?.id === i ? 'blue' : 'gray'}
          onClick={() => handleModify(i)}
          icon={<EditIcon />}
        />
        <IconButton size='sm' onClick={() => handleRemoveField(i)} icon={<DeleteIcon color='red.500' />} />
        <IconButton size='sm' onClick={() => handleMoveUp(i)} icon={<TriangleUpIcon />} />
        <IconButton size='sm' onClick={() => handleMoveDown(i)} icon={<TriangleDownIcon />} />
      </div>
    }))
  , [fields, onModify])
  const fieldColumns = useMemo(formFieldColumns, [])

  const getField = () => {
    const fieldValues = getValues()
    const details = {
      name: fieldValues.question,
      type: fieldValues.type,
      validation: { required: fieldValues.required }
    }
    if (fieldValues.type === 'text') return details
    else return {
      ...details,
      options: fieldValues.options.map((f, i) => ({ value: i, text: f })),
    }
  }

  const reset = () => {
    setValue('question', '')
    setValue('options', DEFAULT_FIELD_VALUES)
  }

  const handleAddField = e => {
    e.preventDefault()
    setFields(fields.concat(getField()))
    reset()
  }

  const handleModifyField = e => {
    e.preventDefault()
    setOnModify()
    setFields(fields.map((f, i) => onModify.id === i ? getField() : f))
    reset()
  }

  if (!fieldData) return <></>

  return <>
    <form id='custom-add' onSubmit={handleAddField} />
    <form id='custom-modify' onSubmit={handleModifyField} />
    <form id={formId} onSubmit={handleSubmit(v => onSubmit({
      fields: JSON.stringify(fields),
      name: v.name
    }))} style={{ overflowX: 'hidden', padding: 3 }}>
      <Input id='name' title={required(t('form-name'))} {...register('name')} />
      {errors.name && <Error>{t(errors.name.message)}</Error>}
      <Table nosort data={fieldData} columns={fieldColumns} component={() => (<>
        <div style={{ height: 30 }}></div>
        <div style={{ margin: 10 }}>
          <Title>{t('field-type')}</Title>
          <RadioGroup value={watch('type')} onChange={v => setValue('type', v)}>
            <Stack direction='horizontal'>
              <Radio value='text'>{t('text-box')}</Radio>
              <Radio value='checkbox' style={{ marginLeft: 20 }}>{t('check-box')}</Radio>
              <Radio value='radio' style={{ marginLeft: 20 }}>{t('radio-box')}</Radio>
            </Stack>
          </RadioGroup>
          <Input style={{ maxWidth: 450 }} id='question' title={t('question')} {...register('question')}/>
          {watch('type') !== 'text' && <div>
            <Title>{t('field-options')}</Title>
            {watch('options').map((v, i) => <div key={i}>
              <Input
                style={{ maxWidth: 450, width: '77%' }}
                value={v}
                onChange={e => {
                  const options = watch('options')
                  options[i] = e.target.value
                  setValue('options', options)
                }}
              />
              <span style={{ marginLeft: 15 }}>
                {watch('options')?.length > 1 && <IconButton
                  style={{ padding: 12 }}
                  onClick={() => setValue('options', watch('options').filter((v, j) => i !== j))}
                  icon={<DeleteIcon color='red.500' />}
                />}
                {i + 1 === watch('options')?.length && <IconButton
                  style={{ padding: 12, marginLeft: 5 }}
                  onClick={() => setValue('options', watch('options').concat(''))}
                  icon={<AddIcon />}
                />}
              </span>
            </div>)}
          </div>}
          <div>
            <Checkbox
              style={{ marginTop: 10 }}
              onChange={v => setValue('required', v.target.checked)}
              isChecked={watch('required')}
            >{t('required')}</Checkbox>
          </div>
        </div>
      </>)}/>
    </form>
  </>
})

export default Form