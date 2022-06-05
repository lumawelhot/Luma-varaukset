const getBookingInfo = ({
  eventName,
  eventDescription,
  eventScienceClasses,
  eventDate,
  eventStart,
  eventEnd,
  eventType,
  name,
  phone,
  email,
  schoolName,
  schoolLocation,
  grade,
  participants,
  dataUseAgreement,
  language,
  customFormHtml
}) => {
  return `
  <!DOCTYPE html>
  <body>
    <style>
      body {
        font-family: sans-serif;;
      }
      #header {
        text-align: center;
        text-decoration: underline;
        padding-bottom: 30px;
      }
      .container {
        margin-left: 1em;
      }
      .grid-container {
        display: grid;
        gap: 50px;
        grid-template-columns: 200px auto;
      }
      .grid-item {
        padding-bottom: 5px;
      }
    </style>
    <h1 id="header">
      Varauksen tiedot
    </h1>
    <h3 id="subheader">
      Vierailun tiedot:
    </h3>
    <div class="container">
      <div class="grid-container">
        <div class="grid-item">Vierailun nimi</div>
        <div class="grid-item">${eventName}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Vierailun kuvaus</div>
        <div class="grid-item">${eventDescription}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Tiedeluokka(t)</div>
        <div class="grid-item">${eventScienceClasses}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Päivämäärä</div>
        <div class="grid-item">${eventDate}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Aloitusajankohta</div>
        <div class="grid-item">${eventStart}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Lopetusajankohta</div>
        <div class="grid-item">${eventEnd}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Vierailun tyyppi</div>
        <div class="grid-item">${eventType}</div>
      </div>
    </div>
    <h3 id="subheader">
      Varaajan tiedot:
    </h3>
    <div class="container">
      <div class="grid-container">
        <div class="grid-item">Varaajan nimi</div>
        <div class="grid-item">${name}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Varaajan puhelinnumero</div>
        <div class="grid-item">${phone}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Varaajan sähköpostiosoite</div>
        <div class="grid-item">${email}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Opetusyhteisön nimi</div>
        <div class="grid-item">${schoolName}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Opetusyhteisön sijainti</div>
        <div class="grid-item">${schoolLocation}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Luokka-aste</div>
        <div class="grid-item">${grade}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Osallistujamäärä</div>
        <div class="grid-item">${participants}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Lupa tutkimuskäyttöön</div>
        <div class="grid-item">${dataUseAgreement}</div>
      </div>
      <div class="grid-container">
        <div class="grid-item">Kieli</div>
        <div class="grid-item">${language}</div>
      </div>
      ${customFormHtml}
    </div>
  </body>
`}

module.exports = { getBookingInfo }