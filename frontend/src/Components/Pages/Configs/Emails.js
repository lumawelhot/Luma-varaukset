import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../Embeds/Button'
import { emailColumns } from '../../../helpers/columns'
import { MiscContext } from '../../../services/contexts'
import Table from '../../Table'
import { default as EmailModal } from '../../Modals/Emails'
import { useTranslation } from 'react-i18next'

const Emails = () => {
  const { fetchEmails, emails } = useContext(MiscContext)
  const [template, setTemplate] = useState()
  const { t } = useTranslation()

  useEffect(fetchEmails, [])

  const templates = useMemo(() => emails
    ?.map(e => ({
      name: e.name,
      subject: e.subject,
      options: <Button onClick={() => setTemplate(e)}>{t('modify-template')}</Button>
    }))
  , [emails, t])

  const columns = useMemo(emailColumns, [t])

  if (!templates) return <></>

  return <>
    <Table nosort columns={columns} data={templates} />
    <EmailModal
      show={template ? true : false}
      close={() => setTemplate()}
      template={template}
    />
  </>
}

export default Emails