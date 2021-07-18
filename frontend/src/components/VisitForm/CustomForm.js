import React from 'react'
import { useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { GET_FORM } from '../../graphql/queries'

const CustomForm = ({ formid }) => {
  const { t } = useTranslation('common')

  const { loading, error, data } = useQuery(GET_FORM, {
    variables: { id: formid },
    onError: (error) => console.log('virheviesti: ', error),
  })

  if (loading) return <p className="notification">Searching form...</p>
  if (error) return <p className="notification">{t('error')}</p>

  return (
    <div>
      <p>
        {JSON.stringify(data.getForm)}
      </p>
    </div>
  )
}

export default CustomForm