import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VisitContext, EventContext } from '../../services/contexts'
import { visitColumns } from '../../helpers/columns'
import { Heading } from '@chakra-ui/react'
import { format } from 'date-fns'
import Table from '../Table'
import { useNavigate } from 'react-router-dom'
import { CLASSES } from '../../config'
import { Badge } from '../../Embeds/Badge'
import { CopyIcon } from '@chakra-ui/icons'
import { Select } from '../../Embeds/Input'
import { someExist } from '../../helpers/utils'

const VisitList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { all, fetch } = useContext(VisitContext)
  const { find } = useContext(EventContext)
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
  })

  useEffect(fetch, [])

  const visits = useMemo(() => all
    ?.filter(p => {
      const classes = filterOptions.classes
      if (classes.length <= 0) return true
      return someExist(find(p.event.id)?.resourceids, classes.map(c => c.value))
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
      urlCopy: <span>{t('copy-url')} <CopyIcon style={{ cursor: 'pointer' }} w={4} h={4} /></span>
    }))
  , [all, filterOptions])

  const columns = useMemo(visitColumns, [])

  if (!visits) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('visits')}</Heading>
      <div style={{ maxWidth: 426 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Table data={visits} columns={columns} />
    </>
  )
}

export default VisitList
