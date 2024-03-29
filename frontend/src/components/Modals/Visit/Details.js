import React from 'react'
import { Title, Text, Li, Ul, P } from '../../Embeds/Info'
import { CLASSES, PLATFORMS } from '../../../config'
import { Heading } from '@chakra-ui/react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

const Details = ({ visit, event }) => {
  const { t } = useTranslation()
  const remotePlatform = Number(visit?.teaching?.location) - 1

  return <>
    {visit.cancellation && <>
      <Heading style={{ fontSize: 25 }}>{t('cancellation-details')}</Heading>
      {!!visit.cancellation
      && Array.isArray(visit.cancellation)
      && visit.cancellation?.map((f,index) =>
        <P key={index}>
          <Title>{f.name}: </Title>
          {Array.isArray(f.value) ? <Ul>
            {f.value.map((o, i) => <Li key={i}>{o}</Li>)}
          </Ul> : <Text>{f.value}</Text>}
        </P>
      )}
    </>}
    <Heading style={{ fontSize: 25 }}>{visit.event.title}:</Heading>
    <P>
      <Title>{t('visit-language')}: </Title>
      <Text>{t(`visit-${ visit.language}`)}</Text>
    </P>
    <P>
      <Title>{t('description')}: </Title>
      <Text>{visit.event.desc}</Text>
    </P>
    <P>
      <Title>{t('science-class')}: </Title>
      <Ul>{visit?.event?.resourceids?.map((r, i) => <Li key={i}>{CLASSES[r - 1]?.label}</Li>)}</Ul>
    </P>
    {visit.extras.length ?
      <P>
        <Title>{t('extras')}: </Title>
        <Ul>{visit.extras?.map(extra => <Li key={extra.name}>{extra.name}</Li>) }</Ul>
      </P>
      : null}
    <P>
      <Title>{t('teaching')}</Title>
      <Ul>
        {<Li>{` ${t(visit.teaching.type)}`}</Li>}
      </Ul>
    </P>
    {visit?.teaching?.payload && Object.entries(visit?.teaching?.payload)?.map((e, i) => <P key={i}>
      <Title>{t(e[0])}: </Title>
      <Text>{e[1]}</Text>
    </P>)}
    <P>
      <Title>{t('event-date')}: </Title>
      <Text>{format(new Date(visit.startTime), 'd.M.yyyy')}</Text>
    </P>
    <P>
      <Title>{t('event-start')}: </Title>
      <Text>{format(new Date(visit.startTime), 'HH:mm')}</Text>
    </P>
    <P>
      <Title>{t('event-end')}: </Title>
      <Text>{format(new Date(visit.endTime), 'HH:mm')}</Text>
    </P>
    <Heading style={{ fontSize: 25 }}>{t('given-info')}:</Heading>
    <P>
      <Title>{t('visit-client-name')}: </Title>
      <Text>{visit.clientName}</Text>
    </P>
    <P>
      <Title>{t('visit-client-email')}: </Title>
      <Text>{visit.clientEmail}</Text>
    </P>
    <P>
      <Title>{t('visit-client-phone')}: </Title>
      <Text>{visit.clientPhone}</Text>
    </P>
    <P>
      <Title>{t('school-name')}: </Title>
      <Text>{visit.schoolName}</Text>
    </P>
    <P>
      <Title>{t('school-location')}: </Title>
      <Text>{visit.schoolLocation}</Text>
    </P>
    <P>
      <Title>{t('selected-grade')}: </Title>
      <Text>{visit.grade}</Text>
    </P>
    <P>
      <Title>{t('grade-information')}: </Title>
      <Text>{visit.gradeInfo}</Text>
    </P>
    <P>
      <Title>{t('participants')}: </Title>
      <Text>{visit.participants}</Text>
    </P>
    {visit?.teaching?.type === 'remote' && <P>
      <Title>{t('selected-remote-platform')}: </Title>
      <Text>{Number.isNaN(remotePlatform) ? visit.teaching.location
        : (PLATFORMS[remotePlatform] ? PLATFORMS[remotePlatform] : event.otherRemotePlatformOption)
      }</Text>
    </P>}
    {!!visit?.customFormData
      && Array.isArray(visit.customFormData)
      && visit.customFormData?.map((f,index) =>
        <P key={index}>
          <Title>{f.name}: </Title>
          {Array.isArray(f.value) ? <Ul>
            {f.value.map((o, i) => <Li key={i}>{o}</Li>)}
          </Ul> : <Text>{f.value}</Text>}
        </P>
      )}
  </>
}

export default Details

Details.propTypes = {
  event: PropTypes.object,
  visit: PropTypes.object
}
