import { Heading } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { groupColumns } from '../../helpers/columns'
import Table from '../Table'
import { Button } from '../Embeds/Button'
import Group from '../Modals/Group'
import { groupInit } from '../../helpers/initialvalues'
import { error, success } from '../../helpers/toasts'
import { useGroups } from '../../hooks/api'

const GroupList = () => {
  const { t } = useTranslation()
  const groupContext = useGroups()
  const [showAdd, setShowAdd] = useState()
  const [showModify, setShowModify] = useState()
  const [group, setGroup] = useState()
  useEffect(() => {
    const exec = () => groupContext.fetch()
    exec()
  }, [])

  const modifyGroup = async values => {
    const { id, name, maxCount } = values
    const status = await groupContext.modify({
      id,
      name,
      maxCount: Number(maxCount)
    })
    if (status) success(t('notify-group-modify-success'))
    else error(t('notify-group-modify-failed'))
    return status
  }

  const addGroup = async values => {
    const { name, maxCount } = values
    const status = await groupContext.add({
      name,
      maxCount: Number(maxCount)
    })
    if (status) success(t('notify-group-create-success'))
    else error(t('notify-group-create-failed'))
    return status
  }

  const handleRemove = (ids) => groupContext.remove(ids)

  const groups = useMemo(() => groupContext?.all?.map(g => ({
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
  })), [groupContext.all, t])

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
