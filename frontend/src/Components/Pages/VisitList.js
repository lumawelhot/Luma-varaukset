import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { visitColumns, visitInitialState } from '../../helpers/columns'
import { Heading } from '@chakra-ui/react'
import { format } from 'date-fns'
import Table from '../Table'
import { useNavigate } from 'react-router-dom'
import { CLASSES } from '../../config'
import { Badge } from '../Embeds/Badge'
import { Select } from '../Embeds/Input'
import { exec, someExist } from '../../helpers/utils'
import Clipboard from '../Embeds/Clipboard'
import { useVisits, useEvents } from '../../hooks/cache'

const VisitList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { all, fetchAll } = useVisits()
  const { find } = useEvents()
  const [filterOptions, setFilterOptions] = useState({ classes: [] })

  useEffect(exec(fetchAll), [])

  const visits = useMemo(() => all
    ?.filter(p => {
      const { classes } = filterOptions
      if (classes.length <= 0) return true
      return someExist(find(p?.event?.id)?.resourceids, classes.map(c => c.value))
    })
    ?.map(v => ({
      title: <span
        style={{ cursor: 'pointer ' }}
        onClick={() => navigate(`/visits/${v.id}`)}
      >{v.event?.title}</span>,
      resourceids: v.event?.resourceids
        ?.map((t, i) => <Badge key={i} style={{
          backgroundColor: CLASSES[Number(t) - 1]?.color,
          marginBottom: 2,
          marginTop: 2,
          fontSize: 13
        }}>{CLASSES[Number(t) - 1]?.label}</Badge>),
      date: format(new Date(v.startTime), 'd.M.y'),
      status: v.status ? t('status-true') : t('status-false'),
      urlCopy: <Clipboard text={t('copy-url')} content={`${window.location.href.split('/visits')[0]}/${v?.id}`} />,
      created: v.created ? format(new Date(v.created), 'd.M.y - HH:mm') : ''
    }))
  , [all, filterOptions, t])

  const columns = useMemo(visitColumns, [t])

  if (!visits) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('visits')}</Heading>
      <div style={{ maxWidth: 440 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Table data={visits} columns={columns} initialState={visitInitialState} />
    </>
  )
}

export default VisitList
