import React from 'react'
import { Popover, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { classes } from '../../helpers/classes'

const LumaEvent = ({ eventInfo }) => {
  const { t } = useTranslation('common')
  const event = eventInfo.event
  const details = event.extendedProps.details
  // view Type löytyy eventInfo.view.type, esim 'dayGridMonth'

  const getTimeRange = () => {
    const start = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(event.start)
    const end = new Intl.DateTimeFormat('fi-FI',{ timeStyle: 'short', timeZone: 'Europe/Helsinki' }).format(event.end)
    return `${start} - ${end}`
  }

  if (!details) return <div>{getTimeRange()}</div>

  const resourceNames = details.resourceids.map(id => { return { name: classes[id-1]?.label || null, description: t(classes[id-1].i18n) }})

  const parseDescription = (text) => {
    return (
      <span dangerouslySetInnerHTML={{ __html: text }}></span>
    )
  }

  const popoverContent = () => {

    return (
      <Space direction='vertical'>
        {details.locked ? <div style={{ color: 'red', margin: 5 }}>
          {t('this-event-is-locked')}
        </div> : null}
        <Space direction='horizontal'>
          {details.tags.map(t => <Tag key={t.id} color='geekblue'>{t.name}</Tag> )}
        </Space>
        {resourceNames.map(r => <span key={r.name}>{r.name +' (' + r.description + ')'}</span>)}
        <i>{details.desc ? parseDescription(details.desc) : null}</i>
      </Space>
    )
  }

  let agenda = eventInfo.view.type === 'listMonth' ? true : false

  const popoverTitle = () => {

    return <Space size='middle'>
      {getTimeRange()}
      {details.titleText}
      {`(${details.languages?.map(lang => {
        if (lang === 'en')
          return 'EN'
        if (lang === 'sv')
          return 'SW'
        return 'FI'
      }).join(', ')})`}
    </Space>
  }

  return (
    <div style={{ height: 22 }} >
      <Popover
        title={popoverTitle()}
        content={popoverContent()}
        mouseEnterDelay={1}
        placement='topLeft'
      >
        <span style={{
          backgroundColor: agenda ? undefined : details.color,
          fontSize: '120%',
          width: '100%',
          color: agenda ? (details.disabled ? 'red' : 'black') : 'black',
          paddingLeft: 3,
          borderStyle: agenda ? undefined : 'solid',
          borderRadius: 7,
          position: agenda ? undefined : 'absolute',
          borderColor: agenda ? undefined : details.color,
          height: '100%',
          overflowX: 'hidden'
        }}
        >{details.title}{`${details.disabled ? ` - ${t('disabled')}` : ''}`}</span>
      </Popover>
    </div>
  )
}

export default LumaEvent