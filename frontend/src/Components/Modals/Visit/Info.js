import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../Embeds/Utils'
import { LANG_MAP, CLASSES, GRADES } from '../../../config'
import { format } from 'date-fns'
import { Title, Text, Li, Ul, P } from '../../Embeds/Info'
import { useEvents } from '../../../hooks/cache'

const Info = () => {
  const { t } = useTranslation()
  const { current: event } = useEvents()

  if (!event) return <></>

  return (
    <>
      {event?.tags?.map((t, i) => <Badge key={i} bg='primary'>{t.name}</Badge>)}
      <P>
        <Title>{t('description')}: </Title>
        <div style={{ marginLeft: 10 }}>
          <Text>{event.desc}</Text>
        </div>
      </P>
      <P>
        <Title>{t('languages')}: </Title>
        <Ul>
          {event?.languages?.map((l, i) => <Li key={i}>{t(LANG_MAP[l])}</Li>)}
        </Ul>
      </P>
      <P>
        <Title>{t('science-class')}: </Title>
        <Ul>
          {event?.resourceids?.map((r, i) => <Li key={i}>{CLASSES[r - 1]?.label}</Li>)}
        </Ul>
      </P>
      {!!event?.extras?.length && <P>
        <Title>{t('available-extras')}: </Title>
        <Ul>
          {event?.extras?.map(extra => <Li key={extra.name}>{extra.name}</Li>) }
        </Ul>
      </P>}
      <P>
        <Title>{t('available-grades')}: </Title>
        <Ul>
          {event?.grades?.map((g, i) => <Li key={i}>{t(GRADES[g - 1]?.label)}</Li>)}
        </Ul>
      </P>
      <P>
        <Title>{t('event-on-offer')}: </Title>
        {event.inPersonVisit ? t('in-inperson') : <></>}
        {event.inPersonVisit && event.remoteVisit && t('and-remote')}
        {event.remoteVisit && !event.inPersonVisit ? t('in-remote') : <></>}
      </P>
      <P>
        <Title>{t('event-date')}: </Title>
        <Text>{format(new Date(event.start), 'd.M.yyyy')}</Text>
      </P>
      <P>
        <Title>{t('earliest-start')}: </Title>
        <Text>{format(new Date(event.start), 'HH:mm')}</Text>
      </P>
      <P>
        <Title>{t('latest-end')}: </Title>
        <Text>{format(new Date(event.end), 'HH:mm')}</Text>
      </P>
      <P>
        <Title>{t('length')}: </Title>
        <Text>{event.duration} {t('minutes')}</Text>
      </P>
    </>
  )
}

export default Info
