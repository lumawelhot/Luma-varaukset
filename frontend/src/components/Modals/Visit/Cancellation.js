import React, { useEffect } from 'react'
import { useMisc } from '../../../hooks/cache'
import PropTypes from 'prop-types'
import Title, { Error, required } from '../../Embeds/Title'
import { Input } from '../../Embeds/Input'
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '../../Embeds/Button'
import { useForm } from 'react-hook-form'
import { cancelInitialValues } from '../../../helpers/initialvalues'
import { parseCancellation } from '../../../helpers/parse'
import { CancelFormValidation } from '../../../helpers/validate'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'

const Cancellation = ({ formId, show, onSubmit }) => {
  const { cancelForm: form } = useMisc()
  const { t } = useTranslation()

  const { control, register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(CancelFormValidation(form)),
    defaultValues: form ? cancelInitialValues(form) : undefined,
    mode: 'onTouched'
  })

  useEffect(() => form?.fields && form?.fields?.forEach((field, j) => setValue(`custom-${j}`, field.type === 'checkbox' ? [] : '')), [])

  return (
    <form id={formId} onSubmit={handleSubmit(v => onSubmit(parseCancellation({ ...v, form })))} className={show ? 'visible' : 'hidden'}>

      {/* Some technical debt, this is defined in Modals/VIsit/Form */}
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

export default Cancellation

Cancellation.propTypes = {
  formId: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
