import React, { useState } from 'react'
import clsx from 'clsx'
import { Navigate } from 'react-big-calendar'
import { FaFilter } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'


const LumaToolbar = (props) => {
  const { t } = useTranslation('common')
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  const {
    localizer: { messages },
    label,
  } = props

  const navigate = action => {
    props.onNavigate(action)
  }

  const handleViewChange = view => {
    props.onView(view)
  }

  const viewNamesGroup = (messages) => {
    let viewNames = props.views
    const view = props.view

    if (viewNames.length > 1) {
      return viewNames.map(name => (
        <button
          type="button"
          key={name}
          className={clsx({ 'rbc-active': view === name })}
          onClick={() => handleViewChange(name)}
        >
          {messages[name]}
        </button>
      ))
    }
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button
          type="button"
          onClick={() => navigate(Navigate.TODAY)}
        >
          {messages.today}
        </button>
        <button
          type="button"
          onClick={() => navigate(Navigate.PREVIOUS)}
        >
          {messages.previous}
        </button>
        <button
          type="button"
          onClick={() => navigate(Navigate.NEXT)}
        >
          {messages.next}
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">
        {viewNamesGroup(messages)}
      </span>

      <button id="filterButton" type="button" className="button luma" style={{ marginLeft: 10, paddingTop: 3 }} onClick={() => setShowFilterOptions(!showFilterOptions)}>
        <span className="icon is-small" style={{ position: 'relative', top: 2 }}><FaFilter/></span>
        <span>{t('filter')}</span>
        <span id="filterCount"></span>
      </button>
      <div className="filterbox" style={{ display: showFilterOptions ? 'block' : 'none' }}>
        <div className="box">
          <div id="filterdiv"></div>
          <button className="button luma is-small" onClick={() => setShowFilterOptions(!showFilterOptions)}>OK</button>
          <span id="filterspan" ></span>
        </div>
      </div>
    </div>
  )
}

export default LumaToolbar