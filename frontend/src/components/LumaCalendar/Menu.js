/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../Embeds/Button'
import { FaFilter } from 'react-icons/fa'
import Filter from '../Modals/Filter'
import styled from 'styled-components'
import { useEvents } from '../../hooks/cache'
import { BsEye, BsEyeSlash } from 'react-icons/bs'

const NavButton = styled(Button)`margin: 0; margin-left: -1px;`

const DateString = styled.span`
  font-size: 25px;
  font-weight: bold;
  @media (max-width: 1400px) {
    display: none;
    visibility: hidden;
  }
`

const MonthMedia = styled.span`
  @media (max-width: 990px) {
    display: none;
    visibility: hidden;
  }
`

const ToggleMedia = styled.span`
  @media (max-width: 990px) {
    margin-left: 10px !important;
  }
`

const ViewMedia = styled.span`
  @media (max-width: 780px) {
    display: none;
    visibility: hidden;
  }
`

const NoEye = styled.span`
  @media (max-width: 420px) {
    display: none;
    visibility: hidden;
  }
`

const CalendarMenu = React.forwardRef((_, ref) => {
  const [showFilter, setShowFilter] = useState(false)
  const calApi = ref.current?.getApi()
  const view = calApi?.view?.type
  const title = calApi?.currentDataManager?.data?.viewTitle
  const { t } = useTranslation()
  const { filterOptions, setFilterOptions } = useEvents()

  return (
    <div style={{ marginBottom: 30, justifyContent: 'space-between', display: 'flex', marginRight: -10, marginLeft: -10 }}>
      {showFilter && <Filter close={() => setShowFilter(false)} />}
      <ToggleMedia>
        <MonthMedia>
          <Button style={{ marginRight: 15 }} onClick={() => calApi?.today()}>{t('today')}</Button>
        </MonthMedia>
        <NavButton onClick={() => calApi?.prev()}>{'<'}</NavButton>
        <NavButton onClick={() => calApi?.next()}>{'>'}</NavButton>
      </ToggleMedia>
      <DateString>{title}</DateString>
      <div>
        <ViewMedia>
          <MonthMedia>
            <NavButton
              className={view === 'dayGridMonth' ? 'active' : ''}
              onClick={() => calApi.changeView('dayGridMonth', calApi.getDate())}
            >{t('month')}</NavButton>
          </MonthMedia>
          <NavButton
            onClick={() => calApi.changeView('timeGridWeek', calApi.getDate())}
            className={view === 'timeGridWeek' ? 'active' : ''}
          >{t('week')}</NavButton>
          <NavButton
            onClick={() => calApi.changeView('timeGridDay', calApi.getDate())}
            className={view === 'timeGridDay' ? 'active' : ''}
          >{t('day')}</NavButton>
        </ViewMedia>
        <NavButton
          onClick={e => {
            if (e.view.innerWidth <= 500 && calApi.view.type === 'listMonth') {
              calApi.changeView('timeGridWeek', calApi.getDate())
            } else calApi.changeView('listMonth', calApi.getDate())
          }}
          className={view === 'listMonth' ? 'active' : ''}
        >{t('agenda')}</NavButton>
        <NoEye>
          <NavButton
            style={{ marginLeft: 15 }}
            onClick={() => setFilterOptions({
              ...filterOptions,
              showUnavailable: !filterOptions.showUnavailable
            })}
          >
            {filterOptions.showUnavailable
              ? <BsEye style={{ fontSize: 18 }} />
              : <BsEyeSlash style={{ fontSize: 18 }} />
            }
          </NavButton>
        </NoEye>
        <NavButton style={{ marginRight: 10 }} onClick={() => setShowFilter(true)}>
          <FaFilter style={{ marginRight: 5 }} />
          {t('filter')}
        </NavButton>
      </div>
    </div>
  )
})

export default CalendarMenu
