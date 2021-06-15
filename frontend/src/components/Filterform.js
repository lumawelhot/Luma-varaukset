import React, { useState } from 'react'

const Filterform = ({ filter }) => {

  const [values, setValues] = useState([false, false, false, false, false])
  const kasittelija = () => {
    const arvot = []
    values.forEach((value, index) => value ? arvot.push(index + 1) : null)
    filter(arvot)
  }

  const muuta = (indeksi) => {
    let uudet = [...values]
    uudet[indeksi] = !uudet[indeksi]
    setValues(uudet)
    kasittelija()
  }

  const naytaKaikki = () => {
    setValues([false, false, false, false, false])
    filter([])
  }

  return (
    <div>
      <button onClick={() => naytaKaikki()}>Näytä kaikki</button>
      <input type="checkbox" name="class" checked={values[0]} onChange={() => muuta(0)} />
      <label htmlFor="class1"> SUMMAMUTIKKA</label>
      <input type="checkbox" name="class" checked={values[1]} onChange={() => muuta(1)} />
      <label htmlFor="class2"> FOTONI</label>
      <input type="checkbox" name="class" checked={values[2]} onChange={() => muuta(2)} />
      <label htmlFor="class3"> LINKKI</label>
      <input type="checkbox" name="class" checked={values[3]} onChange={() => muuta(3)} />
      <label htmlFor="class3"> GEOPISTE</label>
      <input type="checkbox" name="class" checked={values[4]} onChange={() => muuta(4)} />
      <label htmlFor="class3"> GADOLIN</label>
    </div>
  )
}
export default Filterform