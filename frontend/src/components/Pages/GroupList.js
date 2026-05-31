import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { groupColumns } from '../../helpers/columns'
import Table from '../Table'
import { CLASSES } from '../../config'
import { BsCheck2Circle } from 'react-icons/bs'
import { Button } from '../Embeds/Button'
import Group from '../Modals/Group'
import { groupInit } from '../../helpers/initialvalues'
import { exec, someExist } from '../../helpers/utils'
import { useGroups } from '../../hooks/cache'
import { Select } from '../Embeds/Input'


const GroupList = () => {
  const { t } = useTranslation()
  const { fetchAll, remove, all } = useGroups()
  const [group, setGroup] = useState()
  const [filterOptions, setFilterOptions] = useState({ classes: [] })
  useEffect(exec(fetchAll), [])

  const groups = useMemo(() => all
    ?.filter(g => {
      const { classes } = filterOptions
      if (classes.length <= 0) return true
      return someExist(g?.classes, classes.map(c => c.value))
    })
    ?.slice()
    .reverse()
    .map(g => ({
      ...g,
      ...CLASSES.reduce((s, c) => {
        s[c.short] = g?.classes?.includes(c.value)
          ? <BsCheck2Circle size={18} />
          : ''
        return s
      }, {}),
      eventCount: g?.events?.length,
      hidden: g?.disabled ? t('yes') : t('no'),
      modifyButton: (
        <Button onClick={() => setGroup(g)}>
          {t('modify')}
        </Button>
      )
    }))
  , [all, filterOptions, t])
  const columns = useMemo(groupColumns, [t])

  if (!groups) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('groups')}</Heading>
      <div style={{ maxWidth: 440 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Table checkboxed data={groups} columns={columns} component={e => (<>
        <Button onClick={() => setGroup(null)}>{t('add-group')}</Button>
        {e.checked.length > 0 && <Button onClick={() => {
          const ids = e.checked.map(v => groups[v].id)
          if (confirm(t('remove-groups-confirm'))) {
            remove(ids)
            e.reset()
          }
        }}
        >{t('remove-selected')}</Button>}
      </>)} />
      {group !== undefined && <Group
        close={() => setGroup()}
        type={group === null ? 'create' : 'modify'}
        initialValues={group ? {
          ...group, classes: group.classes.map(c => String(c))
        } : groupInit}
      />}
    </>
  )
}

export default GroupList
