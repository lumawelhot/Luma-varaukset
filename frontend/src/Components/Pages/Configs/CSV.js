import React, { useContext } from 'react'
import { getCSV } from '../../../helpers/utils'
import { VisitContext } from '../../../services/contexts'
import { Button } from '../../../Embeds/Button'
import { useTranslation } from 'react-i18next'

const CSV = () => {
  const { all } = useContext(VisitContext)
  const { t } = useTranslation()

  return <>
    <Button onClick={async () => {
      getCSV(all)
    }}>{t('get-csv')}</Button>
  </>
}

export default CSV