import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Table from '../Table'
import { Heading } from '@chakra-ui/react'
import { eventColumns, eventInitialState } from '../../helpers/columns'
import { format } from 'date-fns'
import { Button } from '../Embeds/Button'
import { Select } from '../Embeds/Input'
import { CLASSES } from '../../config'
import { Stack } from 'react-bootstrap'
import { DatePicker } from '../Embeds/Picker'
import Title from '../Embeds/Title'
import { Badge } from '../Embeds/Badge'
import EventListForms from '../Modals/EventListForms'
import { useUsers, useEvents } from '../../hooks/cache'
import { useEventListFilter } from '../../hooks/filter'

const EventList = () => {
  const { t } = useTranslation()
  const { all } = useEvents()
  const { current: user } = useUsers()
  const [showForms, setShowForms] = useState(false)
  const [selected, setSelected] = useState()

  const [filtered, filterOptions, setFilterOptions] = useEventListFilter({ all })
  const events = useMemo(() => filtered
    ?.map(e => ({
      id: e.id,
      title: e.title,
      resources: e?.resourceids?.map((t, i) => <Badge key={i} style={{
        backgroundColor: CLASSES[Number(t) - 1]?.color,
        marginBottom: 2,
        marginTop: 2,
        fontSize: 13
      }}>{CLASSES[Number(t) - 1]?.label}</Badge>),
      date: format(new Date(e.start), 'd.M.y'),
      time: <span>{format(new Date(e.start), 'HH:mm')} - {format(new Date(e.end), 'HH:mm')}</span>,
      group: e?.group?.name,
      visitCount: e?.visits?.length,
      publishDate: e.publishDate ? format(new Date(e.publishDate), 'H:mm, d.M.y') : null
    }))
  , [filtered, t])

  const handle = ({ checked, reset, type }) => {
    setSelected({ selected: checked.map(v => events[v]), type, reset })
    setShowForms(true)
  }

  const columns = useMemo(eventColumns, [t])

  if (!events) return <></>

  return (
    <>
      <Heading as='h1' style={{ paddingBottom: 30 }}>{t('events')}</Heading>
      <div style={{ maxWidth: 440 }}>
        <Select
          title={t('filter-by-classes')}
          value={filterOptions.classes}
          onChange={e => setFilterOptions({ ...filterOptions, classes: e })}
          options={CLASSES}
        />
      </div>
      <Title>{t('time-range')}</Title>
      <Stack style={{ marginTop: -10, overflowX: 'auto' }} direction='horizontal'>
        <DatePicker
          cleanable
          placeholder={t('choose-date')}
          value={filterOptions.range.start}
          style={{ width: 200 }}
          onChange={v => setFilterOptions({ ...filterOptions, range: { start: v, end: filterOptions.range.end } })}
        />
        <span style={{ marginRight: 10, marginLeft: 10, marginTop: 5, fontWeight: 'bolder' }}>–</span>
        <DatePicker
          cleanable
          placeholder={t('choose-date')}
          value={filterOptions.range.end}
          style={{ width: 200 }}
          onChange={v => setFilterOptions({ ...filterOptions, range: { start: filterOptions.range.start, end: v } })}
        />
      </Stack>
      <Table checkboxed data={events} columns={columns} initialState={eventInitialState} component={e => {
        if (e?.checked.length === 0) return <></>
        return <>
          <Button onClick={() => handle({ ...e, type: 'group' })}>{t('add-event-to-group')}</Button>
          <Button onClick={() => handle({ ...e, type: 'publish' })}>{t('set-publishdate')}</Button>
          {user.isAdmin && <Button onClick={() => handle({ ...e, type: 'delete' })}>{t('delete-events')}</Button>}
        </>
      }} />
      {showForms && <EventListForms
        show={showForms}
        close={() => setShowForms()}
        {...selected}
      />}
    </>
  )
}

export default EventList
