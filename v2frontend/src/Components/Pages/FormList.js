import { Heading } from '@chakra-ui/react'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '../Table'
import { FormContext } from '../../services/contexts'
import { formColumns } from '../../helpers/columns'
import { Button } from '../../Embeds/Button'
import CustomForm from '../Modals/CustomForm'

const FormList = () => {
  const { t } = useTranslation()
  const { all, fetch, remove } = useContext(FormContext)
  const [showAdd, setShowAdd] = useState()
  const [showModify, setShowModify] = useState()
  const [selectedForm, setSelectedForm] = useState()

  useEffect(fetch, [])

  const forms = useMemo(() => all
    ?.map(f => ({
      id: f.id,
      name: f.name,
      modifyButton: <Button onClick={() => {
        setSelectedForm(f)
        setShowModify(true)
      }}>{t('modify-form')}</Button>
    }))
  , [all])

  const columns = useMemo(formColumns, [])

  if (!forms) return <></>
  const fields = selectedForm?.fields

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('forms')}</Heading>
      <Table checkboxed data={forms} columns={columns} component={e => (<>
        <Button onClick={() => setShowAdd(true)}>{t('add-new-form')}</Button>
        {e.checked.length > 0 && <Button onClick={() => {
          const ids = e.checked.map(v => all[Number(v)].id)
          if (confirm(t('remove-forms-confirm'))) {
            remove(ids)
            e.reset()
          }
        }}>{t('delete-custom-forms')}</Button>}
      </>)} />
      {showAdd && <CustomForm
        show={showAdd}
        close={() => setShowAdd(false)}
      />}
      {showModify && <CustomForm
        modify
        show={showModify}
        close={() => setShowModify(false)}
        initialValues={{ ...selectedForm, fields: typeof fields === 'string'
          ? JSON.parse(fields) : fields
        }}
      />}
    </>
  )
}

export default FormList
