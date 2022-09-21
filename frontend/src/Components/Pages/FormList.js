import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '../Table'
import { formColumns } from '../../helpers/columns'
import { Button } from '../Embeds/Button'
import CustomForm from '../Modals/CustomForm'
import { useForms } from '../../hooks/cache'
import { exec } from '../../helpers/utils'
import { customformInit } from '../../helpers/initialvalues'

const FormList = () => {
  const { t } = useTranslation()
  const { all, fetchAll, remove } = useForms()
  const [form, setForm] = useState()
  useEffect(exec(fetchAll), [])

  const forms = useMemo(() => all
    ?.filter(f => f.name !== 'cancellation')
    ?.map(f => ({
      ...f,
      modifyButton: <Button onClick={() => setForm(f)}>{t('modify-form')}</Button>
    }))
  , [all, t])
  const columns = useMemo(formColumns, [t])

  if (!forms) return <></>
  const fields = form?.fields

  const cancellation = all.filter(f => f.name === 'cancellation')[0]
  const cancel = (form === null || form === 'cancellation')

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('forms')}</Heading>
      <Table checkboxed data={forms} columns={columns} component={e => (<>
        <Button className='active' onClick={() => setForm(null)}>{t('add-new-form')}</Button>
        <Button onClick={() => {
          setForm(cancellation ? cancellation : 'cancellation')
        }}>{cancellation ? t('modify-cancellation-form') : t('create-cancellation-form')}</Button>
        {cancellation && <Button onClick={() => {
          if (confirm(t('remove-forms-confirm'))) {
            remove(cancellation.id)
            e.reset()
          }
        }}>{t('remove-cancellation-form')}</Button>}
        {e.checked.length > 0 && <Button onClick={() => {
          const ids = e.checked.map(v => all[Number(v)].id)
          if (confirm(t('remove-forms-confirm'))) {
            remove(ids)
            e.reset()
          }
        }}>{t('delete-custom-forms')}</Button>}
      </>)} />
      {form !== undefined && <CustomForm
        close={() => setForm()}
        type={cancel ? 'create' : 'modify'}
        initialValues={cancel ? customformInit(form)
          : { ...form, fields: typeof fields === 'string' ? JSON.parse(fields) : fields }
        }
      />}
    </>
  )
}

export default FormList
