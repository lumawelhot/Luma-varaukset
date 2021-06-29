import React from 'react'

const Filterform = ({ values, setValues }) => {

  const muuta = (item) => {
    const newValues = values.includes(item) ? values.filter(v => v !== item) : values.concat(item)
    setValues(newValues)
  }

  return (
    <div className="field is-grouped">
      <div className="field">
        <button className="button luma" onClick={() => setValues([])}>Näytä kaikki</button>
      </div>
      <div className="field-label is-normal">
        <label className="label">Suodata tiedeluokan mukaan: </label>
      </div>
      <div className="field is-grouped">
        <button
          className={`button luma ${values.includes(1) ? 'active' : ''}`}
          onClick={() => muuta(1)}
        >
        SUMMAMUTIKKA
        </button>
        <button
          className={`button luma ${values.includes(2) ? 'active' : ''}`}
          onClick={() => muuta(2)}
        >
        FOTONI
        </button>
        <button
          className={`button luma ${values.includes(3) ? 'active' : ''}`}
          onClick={() => muuta(3)}
        >
        LINKKI
        </button>
        <button
          className={`button luma ${values.includes(4) ? 'active' : ''}`}
          onClick={() => muuta(4)}
        >
        GEOPISTE
        </button>
        <button
          className={`button luma ${values.includes(5) ? 'active' : ''}`}
          onClick={() => muuta(5)}
        >
        GADOLIN
        </button>
      </div>
    </div>
  )
}
export default Filterform