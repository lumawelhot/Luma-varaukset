import React, { useState } from 'react'
import Filterform from './Filterform'
import FilterByVisitType from './FilterByVisitType'

const CalendarFilter = (props) => {
  const [resources, setResources] = useState([])
  const [remote, setRemote] = useState(true)
  const [inPerson, setInPerson] = useState(true)

  const handleChange = (newValues) => {
    setResources(newValues)
    if (!newValues.length) {
      props.setFilterFunction(() => () => { return true })
      setRemote(true)
      setInPerson(true)
    } else {
      props.setFilterFunction(() => (event) => {
        return newValues.includes(event.resourceId)
        &&
        ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      })
    }
  }

  const handleChangeRemote = (newValue) => {
    setRemote(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? resources.includes(event.resourceId) : true)
        &&
        ((inPerson!==false && event.inPersonVisit) || (newValue!==false && event.remoteVisit))
    })
  }

  const handleChangeInPerson = (newValue) => {
    setInPerson(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? resources.includes(event.resourceId) : true)
      &&
      ((newValue!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
    })
  }

  return (
    <>
      <Filterform values={resources} setValues={handleChange} />
      <FilterByVisitType remote={remote} setRemote={handleChangeRemote} inPerson={inPerson} setInPerson={handleChangeInPerson} />
    </>
  )
}

export default CalendarFilter