import React from 'react'
import { Popover } from 'antd'
import { useTranslation } from 'react-i18next'

const LumaEvent = ({ event }) => {
  const { t } = useTranslation('common')

  const resourceMap = [
    { resourceids: 1, resourceTitle: 'Summamutikka', description: t('mathematics') },
    { resourceids: 2, resourceTitle: 'Fotoni', description: t('physics') },
    { resourceids: 3, resourceTitle: 'Linkki', description: t('computer-science') },
    { resourceids: 4, resourceTitle: 'Geopiste', description: t('geography') },
    { resourceids: 5, resourceTitle: 'Gadolin', description: t('chemistry') },
  ]

  const resourceNames = event.resourceids.map(id => { return { name: resourceMap[id-1]?.resourceTitle || null, description: resourceMap[id-1]?.description }})

  const popoverContent = () => {
    return (
      <>
        {event.locked ? <div style={{ color: 'red', margin: 5 }}>
          {t('this-event-is-locked')}
        </div> : null}
        <div className="tags">
          {event.tags.map(t => <span key={t.id} className="tag" style={{ color: 'geekblue' }}>{t.name}</span> )}
        </div>
        {resourceNames.map(r => <p key={r.name}>{r.name +' (' + r.description + ')'}</p>)}
        <i>{event.desc}</i>
      </>
    )
  }
  return (
    <Popover
      title={event.title}
      content={popoverContent()}
    >
      <span>{event.title}</span>
    </Popover>
  )
}

export default LumaEvent