import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { groupColumns } from '../../helpers/columns'
import Table from '../Table'
import { Button } from '../Embeds/Button'
import Group from '../Modals/Group'
import { groupInit } from '../../helpers/initialvalues'
import { exec } from '../../helpers/utils'
import { notifier } from '../../helpers/notifier'
import { useGroups } from '../../hooks/cache'

const GroupList = () => {
  const { t } = useTranslation()
  const { fetchAll, modify, add, remove, all } = useGroups()
  const [showAdd, setShowAdd] = useState()
  const [showModify, setShowModify] = useState()
  const [group, setGroup] = useState()
  useEffect(exec(fetchAll), [])

  const modifyGroup = async values => {
    const { id, name, maxCount } = values
    const status = await modify({ id, name, maxCount: Number(maxCount) })
    notifier.modifyGroup(status)
    return status
  }

  const addGroup = async values => {
    const { name, maxCount } = values
    const status = await add({ name, maxCount: Number(maxCount) })
    notifier.addGroup(status)
    return status
  }

  const handleRemove = ids => remove(ids)

  const groups = useMemo(() => all?.map(g => ({
    id: g.id,
    name: g.name,
    maxCount: g.maxCount,
    visitCount: g.visitCount,
    eventCount: g.events.length,
    hidden: g.disabled ? t('yes') : t('no'),
    modifyButton: <Button onClick={() => {
      setGroup(g)
      setShowModify(true)
    }}>{t('modify')}</Button>
  })), [all, t])

  const columns = useMemo(groupColumns, [t])

  if (!groups) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('groups')}</Heading>
      <Table checkboxed data={groups} columns={columns} component={e => (<>
        <Button onClick={() => setShowAdd(true)}>{t('add-group')}</Button>
        {e.checked.length > 0 && <Button onClick={() => {
          const ids = e.checked.map(v => groups[v].id)
          handleRemove(ids)
          e.reset()
        }}
        >{t('remove-selected')}</Button>}
      </>)} />
      {showAdd && <Group
        show={showAdd}
        close={() => setShowAdd(false)}
        handle={addGroup}
        title={t('create-group')}
        initialValues={groupInit}
      />}
      {showModify && <Group
        show={showModify}
        close={() => setShowModify(false)}
        handle={v => modifyGroup({ ...v, id: group.id })}
        title={t('modify-group')}
        initialValues={group ? {
          name: group.name,
          maxCount: String(group.maxCount)
        } : groupInit}
      />}
    </>
  )
}

export default GroupList
