import React from 'react'
import { getCSV } from '../../../helpers/utils'
import { Button } from '../../Embeds/Button'
import { useTranslation } from 'react-i18next'
import { useEvents } from '../../../hooks/api'
import { useVisits } from '../../../hooks/cache'

const CSV = () => {
  const { all } = useVisits()
  const { find } = useEvents()
  const { t } = useTranslation()

  return <>
    <Button onClick={() => {
      getCSV(all, find)
    }}>{t('get-csv')}</Button>
  </>
}

export default CSV
