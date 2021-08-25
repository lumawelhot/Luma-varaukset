import React from 'react'
import { Popover } from 'antd'
import { useTranslation } from 'react-i18next'
import { resourceColorsLUMA } from '../../helpers/styles'
import { differenceInDays, differenceInMinutes } from 'date-fns'

const LumaEvent = ({ eventInfo, currentUser }) => {
  const { t } = useTranslation('common')
  const event = eventInfo.event
  const details = event.extendedProps.details
  // view Type löytyy eventInfo.view.type, esim 'dayGridMonth'

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
      <>
        {details.locked ? <div style={{ color: 'red', margin: 5 }}>
          {t('this-event-is-locked')}
        </div> : null}
        <div className="tags">
          {details.tags.map(t => <span key={t.id} className="tag" style={{ color: 'geekblue' }}>{t.name}</span> )}
        </div>
        {resourceNames.map(r => <p key={r.name}>{r.name +' (' + r.description + ')'}</p>)}
        <i>{details.desc}</i>
      </>
    )
  }
  const after14Days = differenceInDays(details.start, new Date()) >= 14
  const after1Hour = differenceInMinutes(details.start, new Date()) >= 60
  const booked = (!currentUser && !after14Days) || (currentUser && !after1Hour) || details.booked

  let agenda = eventInfo.view.type === 'listMonth' ? true : false

  return (
    <div style={{ height: 22 }} >
      <Popover
        title={details.title}
        content={popoverContent()}
        mouseEnterDelay={1}
      >
        <span style={{
          backgroundColor: agenda ? undefined : (booked ? '#8a8a8a' : (details.resourceids.length > 1 ? 'black' : resourceColorsLUMA[details.resourceids[0] - 1])),
          fontSize: '120%',
          width: '100%',
          color: agenda ? 'black' : 'white',
          paddingLeft: 3,
          borderStyle: agenda ? undefined : 'solid',
          borderRadius: 7,
          position: agenda ? undefined : 'absolute',
          borderColor: booked ? '#8a8a8a' : (details.resourceids.length > 1 ? 'black' : resourceColorsLUMA[details.resourceids[0] - 1]),
          height: '100%'
        }}
        >{details.title}</span>
      </Popover>
    </div>
  )
}

export default LumaEvent