import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExtraValidation } from '../../../helpers/validate'
import { Input } from '../../Embeds/Input'
import { Error } from '../../Embeds/Title'
import { Stack } from 'react-bootstrap'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { CheckboxGroup } from '../../Embeds/Button'
import { CLASSES } from '../../../config'
import { Checkbox } from '../../Embeds/Button'

const Form = ({ onSubmit, initialValues, formId }) => {
  const { t } = useTranslation()
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(ExtraValidation),
    defaultValues: initialValues,
    mode: 'onTouched'
  })

  return <form id={formId} onSubmit={handleSubmit(onSubmit)} >
    <Input id='name' title={t('extra-name')} {...register('name')} />
    {errors.name && <Error>{t(errors.name.message)}</Error>}
    <Stack direction='horizontal'>
      <div style={{ width: '100%', marginRight: 15 }}>
        <Input id='inPersonLength' title={t('inperson-length')} type='number' {...register('inPersonLength')} />
        {errors.inPersonLength && <Error>{t(errors.inPersonLength.message)}</Error>}
      </div>
      <div style={{ width: '100%' }}>
        <Input id='remoteLength' title={t('remote-length')} type='number' {...register('remoteLength')} />
        {errors.remoteLength && <Error>{t(errors.remoteLength.message)}</Error>}
      </div>
    </Stack>
    <CheckboxGroup name='classes' control={control} title={t('extra-classes')} render={<>
      {CLASSES.map(c => <Checkbox key={c.value} value={c.value.toString()}>{c.label}</Checkbox>)}
    </>} />
    {errors.classes && <Error>{t(errors.classes.message)}</Error>}
  </form>
}

export default Form
