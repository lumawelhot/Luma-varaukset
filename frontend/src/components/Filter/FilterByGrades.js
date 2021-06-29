import React from 'react'

const FilterByGrades = ({ grades, setGrades }) => {

  const muuta = (item) => {
    const newValues = grades.includes(item) ? grades.filter(v => v !== item) : grades.concat(item)
    setGrades(newValues)
  }

  return (
    <>
      <p className="label">Suodata luokka-asteen mukaan</p>
      <div className="field is-grouped">
        <div className="field">
          <button
            className={`button luma ${grades.includes(1) ? 'active' : ''}`}
            onClick={() => muuta(1)}
          >
          Varhaiskasvatus
          </button>
        </div>
        <div className="field">
          <button
            className={`button luma ${grades.includes(2) ? 'active' : ''}`}
            onClick={() => muuta(2)}
          >
          1.-2. luokka
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(3) ? 'active' : ''}`}
            onClick={() => muuta(3)}
          >
          3.-6. luokka
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(4) ? 'active' : ''}`}
            onClick={() => muuta(4)}
          >
          7.-9. luokka
          </button>
        </div>
        <div className="field">

          <button
            className={`button luma ${grades.includes(5) ? 'active' : ''}`}
            onClick={() => muuta(5)}
          >
          Toinen aste
          </button>
        </div>
      </div>
    </>
  )
}

export default FilterByGrades