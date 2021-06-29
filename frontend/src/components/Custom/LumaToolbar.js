import React, { useState } from 'react'
import clsx from 'clsx'
import { Navigate } from 'react-big-calendar'
import { FaFilter } from 'react-icons/fa'


const LumaToolbar = (props) => {
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

      <button type="button" className="button luma" style={{ marginLeft: 10, paddingTop: 3 }} onClick={() => setShowFilterOptions(!showFilterOptions)}>
        <span className="icon is-small" style={{ position: 'relative', top: 2 }}><FaFilter/></span>
        <span>Suodata</span>
      </button>
      <div className="filterbox" style={{ display: showFilterOptions ? 'block' : 'none' }}>
        <div id="filterdiv" className="box">
          {/* Content will be injected here */}
          <button className="button luma is-small" onClick={() => setShowFilterOptions(!showFilterOptions)}>OK</button>
        </div>
      </div>
    </div>
  )
}

export default LumaToolbar