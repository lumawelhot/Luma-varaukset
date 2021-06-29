import React, { useState } from 'react'
import Filterform from './Filterform'
import FilterByVisitType from './FilterByVisitType'
import FilterByGrades from './FilterByGrades'

const CalendarFilter = (props) => {
  const [resources, setResources] = useState([1,2,3,4,5])
  const [remote, setRemote] = useState(true)
  const [inPerson, setInPerson] = useState(true)
  const [grades, setGrades] = useState([1,2,3,4,5])

  const handleChange = (newValues) => {
    setResources(newValues)
    if (!newValues.length) {
      props.setFilterFunction(() => () => { return false })
    } else {
      props.setFilterFunction(() => (event) => {
        return event.resourceids.some(r => newValues.includes(r))
        &&
        ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
        &&
        (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
      })
    }
  }

  const handleChangeRemote = (newValue) => {
    setRemote(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
        &&
        ((inPerson!==false && event.inPersonVisit) || (newValue!==false && event.remoteVisit))
        &&
        (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
    })
  }

  const handleChangeInPerson = (newValue) => {
    setInPerson(newValue)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
      &&
      ((newValue!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      &&
      (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
    })
  }

  const handleChangeGrades = (newValues) => {
    setGrades(newValues)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
      &&
      ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      &&
      (newValues.length ? event.grades.some(grade => newValues.includes(grade)) : false)
    })
  }

  const setAll = (selectAll) => {
    if (selectAll) {
      setResources([1,2,3,4,5])
      setRemote(true)
      setInPerson(true)
      setGrades([1,2,3,4,5])
      props.setFilterFunction(() => () => { return true })
    } else {
      setResources([])
      setRemote(false)
      setInPerson(false)
      setGrades([])
      props.setFilterFunction(() => () => { return false })
    }
  }

  const allSelected = (resources.length === 5 && remote && inPerson && grades.length === 5)

  return (
    <>
      <div className="field">
        {allSelected ?
          <button className="button luma" onClick={() => setAll(false)}>Poista kaikki</button>
          :
          <button className="button luma" onClick={() => setAll(true)}>Näytä kaikki</button>}
      </div>
      <Filterform values={resources} setValues={handleChange} />
      <FilterByVisitType remote={remote} setRemote={handleChangeRemote} inPerson={inPerson} setInPerson={handleChangeInPerson} />
      <FilterByGrades grades={grades} setGrades={handleChangeGrades} />
    </>
  )
}

export default CalendarFilter