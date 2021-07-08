import React from 'react'
import { Tooltip } from 'antd'

const Filterform = ({ values, setValues }) => {

  const muuta = (item) => {
    const newValues = values.includes(item) ? values.filter(v => v !== item) : values.concat(item)
    setValues(newValues)
  }

  return (
    <div>
      <p className="label">Suodata tiedeluokan mukaan: </p>
      <div className="field is-grouped">
        <Tooltip title="Matematiikka" color={'geekblue'}>
          <button
            className={`button luma ${values.includes(1) ? 'active' : ''}`}
            onClick={() => muuta(1)}
          >
        SUMMAMUTIKKA
          </button>
        </Tooltip>
        <Tooltip title="Fysiikka" color={'geekblue'}>
          <button
            className={`button luma ${values.includes(2) ? 'active' : ''}`}
            onClick={() => muuta(2)}
          >
        FOTONI
          </button>
        </Tooltip>
        <Tooltip title="Tietojenkäsittelytiede" color={'geekblue'}>
          <button
            className={`button luma ${values.includes(3) ? 'active' : ''}`}
            onClick={() => muuta(3)}
          >
        LINKKI
          </button>
        </Tooltip>
        <Tooltip title="Maantiede" color={'geekblue'}>
          <button
            className={`button luma ${values.includes(4) ? 'active' : ''}`}
            onClick={() => muuta(4)}
          >
        GEOPISTE
          </button>
        </Tooltip>
        <Tooltip title="Kemia" color={'geekblue'}>
          <button
            className={`button luma ${values.includes(5) ? 'active' : ''}`}
            onClick={() => muuta(5)}
          >
        GADOLIN
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
export default Filterform