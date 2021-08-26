import React from 'react'
import { Popover, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'

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

  const resourceMap = [
    { resourceids: 1, resourceTitle: 'Summamutikka', description: t('mathematics') },
    { resourceids: 2, resourceTitle: 'Fotoni', description: t('physics') },
    { resourceids: 3, resourceTitle: 'Linkki', description: t('computer-science') },
    { resourceids: 4, resourceTitle: 'Geopiste', description: t('geography') },
    { resourceids: 5, resourceTitle: 'Gadolin', description: t('chemistry') },
  ]

  const resourceNames = details.resourceids.map(id => { return { name: resourceMap[id-1]?.resourceTitle || null, description: resourceMap[id-1]?.description }})

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
        <i>{details.desc}</i>
      </Space>
    )
  }

  let agenda = eventInfo.view.type === 'listMonth' ? true : false

  const popoverTitle = () => {

    return <Space size='middle'>
      {getTimeRange()}
      {details.titleText}
    </Space>
  }

  return (
    <div style={{ height: 22 }} >
      <Popover
        title={popoverTitle()}
        content={popoverContent()}
        mouseEnterDelay={1}
      >
        <span style={{
          backgroundColor: agenda ? undefined : details.color,
          fontSize: '120%',
          width: '100%',
          color: agenda ? (details.disabled ? 'red' : 'black') : 'white',
          paddingLeft: 3,
          borderStyle: agenda ? undefined : 'solid',
          borderRadius: 7,
          position: agenda ? undefined : 'absolute',
          borderColor: agenda ? undefined : details.color,
          height: '100%'
        }}
        >{details.title}{`${details.disabled ? ` - ${t('disabled')}` : ''}`}</span>
      </Popover>
    </div>
  )
}

export default LumaEvent