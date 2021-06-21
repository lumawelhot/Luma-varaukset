import React from 'react'

const FilterByVisitType = (props) => {
  return (
    <div className="field is-grouped">
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={props.inPerson} onChange={() => props.setInPerson(!props.inPerson)}/>
          Lähiopetus
        </label>
      </div>
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={props.remote} onChange={() => props.setRemote(!props.remote)}/>
          Etäopetus
        </label>
      </div>
    </div>
  )
}

export default FilterByVisitType