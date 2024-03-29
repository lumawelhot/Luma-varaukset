import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../Embeds/Utils'
import { LANG_MAP, CLASSES } from '../../../config'
import { format } from 'date-fns'
import { Title, Text, Li, Ul, P } from '../../Embeds/Info'
import { useEvents } from '../../../hooks/cache'

const Info = () => {
  const { t } = useTranslation()
  const { current: event } = useEvents()

  if (!event) return <></>
  const { limits } = event
  const remoteMax = limits?.remote?.maxParticipants
  const inPersonMax = limits?.inPerson?.maxParticipants
  const schoolMax = limits?.school?.maxParticipants

  return (
    <>
      {event?.tags?.map((t, i) => <Badge key={i} bg='primary'>{t.name}</Badge>)}
      <P>
        <Title>{t('description')}: </Title>
        <Text style={{ marginLeft: 10, display: 'block' }}>{event.desc}</Text>
      </P>
      <P>
        <Title>{t('languages')}: </Title>
        <Ul>{event?.languages?.map((l, i) => <Li key={i}>{t(LANG_MAP[l])}</Li>)}</Ul>
      </P>
      <P>
        <Title>{t('science-class')}: </Title>
        <Ul>{event?.resourceids?.map((r, i) => <Li key={i}>{CLASSES[r - 1]?.label}</Li>)}</Ul>
      </P>
      {!!event?.extras?.length && <P>
        <Title>{t('available-extras')}: </Title>
        <Ul>{event?.extras?.map(extra => <Li key={extra.name}>{extra.name}</Li>) }</Ul>
      </P>}
      <P>
        <Title>{t('available-grades')}: </Title>
        <Ul>{event?.grades?.map(g => g.name)?.sort()?.map((g, i) => <Li key={i}>{t(g)}</Li>)}</Ul>
      </P>
      <P>
        <Title>{t('event-on-offer')}: </Title>
        <Ul>
          {event.inPersonVisit && <Li>{t('in-inperson')}</Li>}
          {event.remoteVisit && <Li>{t('in-remote')}</Li>}
          {event.schoolVisit && <Li>{t('in-school')}</Li>}
        </Ul>
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
      {(remoteMax || inPersonMax) && <P>
        <Title>{t('max-participants')}: </Title>
        <Ul>
          {remoteMax && <Li>{`${t('remote')}: ${remoteMax}`}</Li>}
          {inPersonMax && <Li>{`${t('inperson')}: ${inPersonMax}`}</Li>}
          {schoolMax && <Li>{`${t('school')}: ${schoolMax}`}</Li>}
        </Ul>
      </P>}
    </>
  )
}

export default Info
