import React from 'react'

const Filterform = ({ values, setValues }) => {

  const muuta = (item) => {
    const newValues = values.includes(item) ? values.filter(v => v !== item) : values.concat(item)
    setValues(newValues)
  }

  return (
    <div>
      <p className="label">Suodata tiedeluokan mukaan: </p>
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