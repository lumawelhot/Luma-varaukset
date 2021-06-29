import React from 'react'

const FilterByVisitType = (props) => {
  return (
    <>
      <p className="label">Suodata vierailutyypin mukaan</p>
      <div className="field is-grouped">
        <div className="field">
          <button
            className={`button luma ${props.inPerson ? 'active' : ''}`}
            onClick={() => props.setInPerson(!props.inPerson)}
          >
          Lähiopetus
          </button>
        </div>
        <div className="field">
          <button
            className={`button luma ${props.remote ? 'active' : ''}`}
            onClick={() => props.setRemote(!props.remote)}
          >
          Etäopetus
          </button>
        </div>
      </div>
    </>
  )
}

export default FilterByVisitType