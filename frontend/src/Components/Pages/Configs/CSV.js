import React from 'react'
import { getCSV } from '../../../helpers/utils'
import { Button } from '../../Embeds/Button'
import { useTranslation } from 'react-i18next'
import { useEvents, useVisits } from '../../../hooks/api'

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
