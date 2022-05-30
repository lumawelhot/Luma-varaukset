import { Heading } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../Embeds/Button'
import { getCSV } from '../../helpers/utils'
import { VisitContext } from '../../services/contexts'

const Configs = () => {
  const { t } = useTranslation()
  const visitContext = useContext(VisitContext)

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('configs')}</Heading>
      <Button onClick={async () => {
        await visitContext.fetch()
        getCSV(visitContext.all)
      }}>{t('get-csv')}</Button>
    </>
  )
}

export default Configs
