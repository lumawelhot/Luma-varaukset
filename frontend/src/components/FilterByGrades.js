import React from 'react'

const FilterByGrades = ({ grades, setGrades }) => {

  const muuta = (item) => {
    const newValues = grades.includes(item) ? grades.filter(v => v !== item) : grades.concat(item)
    setGrades(newValues)
  }

  return (
    <div className="field is-grouped">
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={grades.includes(1)} onChange={() => muuta(1)}/>
          Varhaiskasvatus
        </label>
      </div>
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={grades.includes(2)} onChange={() => muuta(2)}/>
          1.-2. luokka
        </label>
      </div>
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={grades.includes(3)} onChange={() => muuta(3)}/>
          3.-6. luokka
        </label>
      </div>
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={grades.includes(4)} onChange={() => muuta(4)}/>
          7.-9. luokka
        </label>
      </div>
      <div className="field">
        <label className="label">
          <input type="checkbox" checked={grades.includes(5)} onChange={() => muuta(5)}/>
          Toinen aste
        </label>
      </div>
    </div>
  )
}

export default FilterByGrades