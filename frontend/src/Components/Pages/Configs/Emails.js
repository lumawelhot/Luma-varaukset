import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../../Embeds/Button'
import { emailColumns } from '../../../helpers/columns'
import Table from '../../Table'
import { default as EmailModal } from '../../Modals/Emails'
import { useTranslation } from 'react-i18next'
import { useMisc } from '../../../hooks/cache'
import { exec } from '../../../helpers/utils'

const Emails = () => {
  const { fetchEmails, emails } = useMisc()
  const [template, setTemplate] = useState()
  const { t } = useTranslation()

  useEffect(exec(fetchEmails), [])

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
