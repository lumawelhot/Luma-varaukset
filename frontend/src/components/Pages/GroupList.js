import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { groupColumns } from '../../helpers/columns'
import Table from '../Table'
import { Button } from '../Embeds/Button'
import Group from '../Modals/Group'
import { groupInit } from '../../helpers/initialvalues'
import { exec } from '../../helpers/utils'
import { useGroups } from '../../hooks/cache'

const GroupList = () => {
  const { t } = useTranslation()
  const { fetchAll, remove, all } = useGroups()
  const [group, setGroup] = useState()
  useEffect(exec(fetchAll), [])

  const groups = useMemo(() => all?.map(g => ({
    ...g,
    eventCount: g?.events?.length,
    hidden: g?.disabled ? t('yes') : t('no'),
    modifyButton: <Button onClick={() => setGroup(g)}>{t('modify')}</Button>
  })), [all, t])
  const columns = useMemo(groupColumns, [t])

  if (!groups) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('groups')}</Heading>
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
        initialValues={group ? group : groupInit}
      />}
    </>
  )
}

export default GroupList
