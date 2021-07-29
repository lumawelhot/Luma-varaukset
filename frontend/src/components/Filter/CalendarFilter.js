import React, { useEffect, useState } from 'react'
import Filterform from './Filterform'
import FilterByVisitType from './FilterByVisitType'
import FilterByGrades from './FilterByGrades'
import TagFilter from './TagFilter'

const CalendarFilter = (props) => {
  const [resources, setResources] = useState([1,2,3,4,5])
  const [remote, setRemote] = useState(true)
  const [inPerson, setInPerson] = useState(true)
  const [grades, setGrades] = useState([1,2,3,4,5])
  const [tags, setTags] = useState([])

  useEffect(() => {
    try {
      let count = 0
      if (resources.length < 5) count += 1
      if (grades.length < 5) count += 1
      if (!inPerson || !remote) count += 1
      if (tags.length) count += 1
      count ?
        document.getElementById('filterButton').classList.add('active')
        : document.getElementById('filterButton').classList.remove('active')
      count ?
        document.getElementById('filterCount').innerHTML = ` (${count})`
        : document.getElementById('filterCount').innerHTML = ''
    } catch (error) {null}
  })

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
        &&
        (!tags.length || tags.some(t => event.tags.map(tag => tag.name).includes(t)))
      })
    }
  }

  const handleChangeType = (remote, inPerson) => {
    setRemote(remote)
    setInPerson(inPerson)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
        &&
        ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
        &&
        (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
        &&
        (!tags.length || tags.some(t => event.tags.map(tag => tag.name).includes(t)))
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
      &&
      (!tags.length || tags.some(t => event.tags.map(tag => tag.name).includes(t)))
    })
  }

  const handleChangeTags = (newTags) => {
    setTags(newTags)
    props.setFilterFunction(() => (event) => {
      return (resources.length ? event.resourceids.some(r => resources.includes(r)) : false)
      &&
      ((inPerson!==false && event.inPersonVisit) || (remote!==false && event.remoteVisit))
      &&
      (grades.length ? event.grades.some(grade => grades.includes(grade)) : false)
      &&
      (!newTags.length || newTags.some(t => event.tags.map(tag => tag.name).includes(t)))
    })
  }

  return (
    <>
      <TagFilter suggestedTags={props.tags} setTags={handleChangeTags} tags={tags} />
      <Filterform values={resources} setValues={handleChange} />
      <FilterByVisitType remote={remote} setType={handleChangeType} inPerson={inPerson} />
      <FilterByGrades grades={grades} setGrades={handleChangeGrades} />
    </>
  )
}

export default CalendarFilter