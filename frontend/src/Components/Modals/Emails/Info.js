import React from 'react'
import styled from 'styled-components'

const Grid = styled.div`
  font-size: large;
  display: grid;
  grid-template-columns: 300px auto;
  gap: 10px;
`
const Strong = styled.strong`padding-right: 20px;`

const Info = () => <Grid>
  <Strong>Varauksen linkki:</Strong> <span>/link/r</span>
  <Strong>Vierailun nimi:</Strong> <span>/event-title/r</span>
  <Strong>Vierailun kuvaus:</Strong> <span>/event-desc/r</span>
  <Strong>Vierailun päivämäärä:</Strong> <span>/event-date/r</span>
  <Strong>Vierailu alkaa:</Strong> <span>/event-start/r</span>
  <Strong>Vierailu päättyy:</Strong> <span>/event-end/r</span>
  <Strong>Vierailun tyyppi:</Strong> <span>/event-type/r</span>
  <Strong>Varaajan nimi:</Strong> <span>/client-name/r</span>
  <Strong>Varaajan puhelinnumero:</Strong> <span>/client-phone/r</span>
  <Strong>Varaajan sähköpostiosoite:</Strong> <span>/client-email/r</span>
  <Strong>Opetusyhteisön nimi:</Strong> <span>/school-name/r</span>
  <Strong>Opetusyhteisön paikkakunta:</Strong> <span>/school-location/r</span>
  <Strong>Luokka-aste:</Strong> <span>/grade/r</span>
  <Strong>Osallistujamäärä:</Strong> <span>/participants/r</span>
  <Strong>Tutkimuskäyttö sallittu:</Strong> <span>/data-use-agreement/r</span>
  <Strong>Kieli:</Strong> <span>/language/r</span>
</Grid>

export default Info
