import React from 'react'
import { useTranslation } from 'react-i18next'
import LumaTagInput from '../LumaTagInput/LumaTagInput'

const TagFilter = ({ suggestedTags, tags, setTags }) => {
  const { t } = useTranslation('common')

  return (
    <>
      <LumaTagInput
        label={t('filter-by-tags')}
        tags={tags}
        setTags={tags => setTags(tags)}
        prompt={t('add-tag')}
        suggestedTags={suggestedTags}
        tagCount={5}
      />
    </>
  )
}

export default TagFilter