import { t } from 'i18next'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../Embeds/Button'
import { emailColumns } from '../../../helpers/columns'
import { MiscContext } from '../../../services/contexts'
import Table from '../../Table'
import { default as EmailModal } from '../../Modals/Emails'

const Emails = () => {
  const { fetchEmails, emails } = useContext(MiscContext)
  const [template, setTemplate] = useState()

  useEffect(fetchEmails, [])

  const templates = useMemo(() => emails
    ?.map(e => ({
      name: e.name,
      subject: e.subject,
      options: <Button onClick={() => setTemplate(e)}>{t('modify-template')}</Button>
    }))
  , [emails])

  const columns = useMemo(emailColumns, [])

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