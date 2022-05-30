/* eslint-disable react/display-name */
import { Formik } from 'formik'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonToolbar, IconButton } from 'rsuite'
import { Input } from '../../../Embeds/Input'
import { formFieldColumns } from '../../../helpers/columns'
import Table from '../../Table'
import { TriangleUpIcon, TriangleDownIcon, DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons'
import { Stack } from 'react-bootstrap'
import { RadioGroup } from '@chakra-ui/react'
import { Radio } from '../../../Embeds/Button'
import { Checkbox } from '../../../Embeds/Table'
import Title from '../../../Embeds/Title'
import { DEFAULT_FIELD_VALUES } from '../../../config'
import { eventValidate } from '../../../helpers/validate'

const Form = React.forwardRef(({ fields, setFields, initialValues, onModify, handleModify }, ref) => {
  const { t } = useTranslation()

  const move = (id, step) => {
    if (id + step < 0 || id + step > fields.length - 1) return
    const newFields = [...fields]
    const temp = newFields[id]
    newFields[id] = newFields[id + step]
    newFields[id + step] = temp
    setFields(newFields)
  }

  const handleRemoveField = id => setFields(fields.filter((f, i) => i !== id))
  const handleMoveUp = id => move(id, -1)
  const handleMoveDown = id => move(id, 1)

  const fieldData = useMemo(() => fields
    ?.map((f, i) => ({
      id: i,
      name: f.name,
      required: f.validation.required ? t('yes') : t('no'),
      type: t(f.type),
      optionButtons: <ButtonToolbar style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <IconButton
          appearance={onModify?.id === i ? 'primary' : 'default'}
          onClick={() => handleModify(i)}
          icon={<EditIcon />}
        />
        <IconButton onClick={() => handleRemoveField(i)} icon={<DeleteIcon color='red.500' />} />
        <IconButton onClick={() => handleMoveUp(i)} icon={<TriangleUpIcon />} />
        <IconButton onClick={() => handleMoveDown(i)} icon={<TriangleDownIcon />} />
      </ButtonToolbar>
    }))
  , [fields, onModify])
  const fieldColumns = useMemo(formFieldColumns, [])

  if (!fieldData) return <></>

  return (
    <Formik
      innerRef={ref}
      validate={eventValidate}
      initialValues={{
        name: initialValues.name,
        question: '',
        required: true,
        options: DEFAULT_FIELD_VALUES,
        type: 'text'
      }}
    >
      {({ handleChange, setFieldValue, values }) => (
        <div style={{ overflowX: 'hidden', padding: 3 }}>
          <Input
            id='name'
            title={t('form-name')}
            onChange={handleChange}
            value={values.name}
          />
          <Table nosort data={fieldData} columns={fieldColumns} component={() => (<>
            <div style={{ height: 30 }}></div>
            <div style={{ margin: 10 }}>
              <Title>{t('field-type')}</Title>
              <RadioGroup value={values.type} onChange={v => setFieldValue('type', v)}>
                <Stack direction='horizontal'>
                  <Radio value='text'>{t('text-box')}</Radio>
                  <Radio value='checkbox' style={{ marginLeft: 20 }}>{t('check-box')}</Radio>
                  <Radio value='radio' style={{ marginLeft: 20 }}>{t('radio-box')}</Radio>
                </Stack>
              </RadioGroup>
              <Input
                style={{ maxWidth: 450 }}
                id='question'
                title={t('question')}
                onChange={handleChange}
                value={values.question}
              />
              {values.type !== 'text' && <div>
                <Title>{t('field-options')}</Title>
                {values.options.map((v, i) => <div key={i}>
                  <Input
                    style={{ maxWidth: 450, width: '77%' }}
                    value={v}
                    onChange={e => {
                      const options = values.options
                      options[i] = e.target.value
                      setFieldValue('options', options)
                    }}
                  />
                  <span style={{ marginLeft: 15 }}>
                    {values?.options?.length > 1 && <IconButton
                      style={{ padding: 12 }}
                      onClick={() => setFieldValue('options', values.options.filter((v, j) => i !== j))}
                      icon={<DeleteIcon color='red.500' />}
                    />}
                    {i + 1 === values?.options?.length && <IconButton
                      style={{ padding: 12, marginLeft: 5 }}
                      onClick={() => setFieldValue('options', values.options.concat(''))}
                      icon={<AddIcon />}
                    />}
                  </span>
                </div>)}
              </div>}
              <div>
                <Checkbox
                  style={{ marginTop: 10 }}
                  onChange={v => setFieldValue('required', v.target.checked)}
                  isChecked={values.required}
                >{t('required')}</Checkbox>
              </div>
            </div>
          </>)}/>
        </div>
      )}
    </Formik>
  )
})

export default Form
