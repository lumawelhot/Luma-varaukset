import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { extraColumns } from '../../helpers/columns'
import Table from '../Table'
import { MiscContext } from '../../services/contexts'
import { CLASSES } from '../../config'
import { BsCheck2Circle } from 'react-icons/bs'
import { Button } from '../../Embeds/Button'
import Extra from '../Modals/Extra'
import { extraInit } from '../../helpers/initialvalues'
import { Select } from '../../Embeds/Input'
import { someExist } from '../../helpers/utils'

const ExtraList = () => {
  const { t } = useTranslation()
  const misc = useContext(MiscContext)
  const [showAdd, setShowAdd] = useState(false)
  const [showModify, setShowModify] = useState(false)
  const [extra, setExtra] = useState()
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
  })

  useEffect(() => misc.fetchExtras(), [misc])

  const handleRemove = async ids => await misc.removeExtras(ids)

  const extras = useMemo(() => misc?.extras
    ?.filter(p => {
      const classes = filterOptions.classes
      if (classes.length <= 0) return true
      return someExist(p?.classes, classes.map(c => c.value))
    })
    ?.map(e => ({
      id: e.id,
      name: e.name,
      inPerson: e.inPersonLength,
      remote: e.remoteLength,
      ...CLASSES.reduce((s, c) => {
        s[c.short] = e?.classes?.includes(c.value)
          ? <BsCheck2Circle size={18}/> : ''
        return s
      }, {}),
      modifyButton: <Button
        onClick={() => {
          setExtra(e)
          setShowModify(true)
        }}>{t('modify')}</Button>
    }))
  , [misc.extras, filterOptions])

  const columns = useMemo(extraColumns, [])

  if (!extras) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('extras')}</Heading>
      <div style={{ maxWidth: 426 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Table checkboxed data={extras} columns={columns} component={e => (<>
        <Button onClick={() => setShowAdd(true)}>{t('add-extra')}</Button>
        {e.checked.length > 0 && <Button onClick={() => {
          console.log(e)
          const ids = e.checked.map(c => misc.extras[Number(c)].id) // WHY misc.extras ??
          handleRemove(ids)
          e.reset()
        }}>{t('remove-selected')}</Button>}
      </>)} />
      <Extra
        show={showAdd}
        close={() => setShowAdd(false)}
        handle={misc.addExtra}
        initialValues={extraInit}
        title={t('create-extra')}
      />
      <Extra
        show={showModify}
        close={() => setShowModify(false)}
        handle={v => misc.modifyExtra({ ...v, id: extra.id })}
        initialValues={extra ? {
          name: extra.name,
          inPersonLength: String(extra.inPersonLength),
          remoteLength: String(extra.remoteLength),
          classes: extra.classes.map(c => String(c))
        } : extraInit}
        title={t('modify-extra')}
      />
    </>
  )
}

export default ExtraList
