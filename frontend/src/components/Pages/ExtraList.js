import React, { useEffect, useMemo, useState } from 'react'
import { Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { extraColumns } from '../../helpers/columns'
import Table from '../Table'
import { CLASSES } from '../../config'
import { BsCheck2Circle } from 'react-icons/bs'
import { Button } from '../Embeds/Button'
import Extra from '../Modals/Extra'
import { extraInit } from '../../helpers/initialvalues'
import { Select } from '../Embeds/Input'
import { exec, someExist } from '../../helpers/utils'
import { useExtras } from '../../hooks/cache'

const ExtraList = () => {
  const { t } = useTranslation()
  const { fetchAll, all, remove } = useExtras()
  const [extra, setExtra] = useState()
  const [filterOptions, setFilterOptions] = useState({ classes: [] })

  useEffect(exec(fetchAll), [])

  const handleRemove = ids => remove(ids)

  const extras = useMemo(() => all
    ?.filter(p => {
      const { classes } = filterOptions
      if (classes.length <= 0) return true
      return someExist(p?.classes, classes.map(c => c.value))
    })
    ?.map(e => ({
      ...e,
      ...CLASSES.reduce((s, c) => {
        s[c.short] = e?.classes?.includes(c.value)
          ? <BsCheck2Circle size={18}/> : ''
        return s
      }, {}),
      modifyButton: <Button
        onClick={() => setExtra(e)}>{t('modify')}</Button>
    }))
  , [all, filterOptions, t])
  const columns = useMemo(extraColumns, [t])

  if (!extras) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('extras')}</Heading>
      <div style={{ maxWidth: 440 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Table checkboxed data={extras} columns={columns} component={e => (<>
        <Button onClick={() => setExtra(null)}>{t('create')}</Button>
        {e.checked.length > 0 && <Button onClick={() => {
          const ids = e.checked.map(c => all[Number(c)].id) // WHY misc.extras ??
          handleRemove(ids)
          e.reset()
        }}>{t('remove-selected')}</Button>}
      </>)} />
      {extra !== undefined && <Extra
        close={() => setExtra()}
        type={extra === null ? 'create' : 'modify'}
        initialValues={extra ? {
          ...extra, classes: extra.classes.map(c => String(c))
        } : extraInit}
      />}
    </>
  )
}

export default ExtraList
