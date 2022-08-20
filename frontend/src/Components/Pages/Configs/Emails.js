import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../../Embeds/Button'
import { emailColumns } from '../../../helpers/columns'
import Table from '../../Table'
import { default as EmailModal } from '../../Modals/Emails'
import { useTranslation } from 'react-i18next'
import { useMisc } from '../../../hooks/api'

const Emails = () => {
  const { fetchEmails, emails } = useMisc()
  const [template, setTemplate] = useState()
  const { t } = useTranslation()

  useEffect(() => {
    const exec = () => fetchEmails()
    exec()
  }, [])

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
