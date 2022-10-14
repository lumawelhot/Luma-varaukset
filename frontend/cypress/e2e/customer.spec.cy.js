describe('As a customer I can', () => {

  beforeEach(() => {
    cy.request('http://localhost:3001/reset')
  })

  // eslint-disable-next-line cypress/no-unnecessary-waiting
  afterEach(() => cy.wait(1000))

  it('book an event', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Kuukausi').click()
    cy.get('.event-overlay').first().click()
    cy.contains('Varaa vierailu').click()
    cy.get('#clientName').type('Olli opettaja')
    cy.get('#schoolName').type('Alppilan koulu')
    cy.get('#schoolLocation').type('Alppila')
    cy.get('#clientEmail').type('olli.opettaja@client.com')
    cy.get('#verifyEmail').type('olli.opettaja@client.com')
    cy.get('#clientPhone').type('+358 31331313')
    cy.get('#grade').type('1 luokka')
    cy.get('#participants').type('13')
    cy.get(':nth-child(1) > .chakra-checkbox__control').click()
    cy.get(':nth-child(3) > .chakra-checkbox__control').click()
    cy.get('#book').click()
    cy.get('[style="margin-left: -10px; margin-top: 20px;"] > .sc-dkzDqf').click()
    cy.contains('Olet varannut vierailun')
    cy.contains('Olli opettaja')
  })

  it('cancel an event', () => {
    cy.request('http://localhost:3001/testdata').then(r => {
      const { visits } = r.body
      cy.visit(`http://localhost:3000/${visits[0].id}/`)
      cy.contains('Peru vierailu')
      cy.get('.modal-footer > .sc-dkzDqf').click()
      cy.get(':nth-child(1) > .vstack > :nth-child(1) > .chakra-checkbox__control').click()
      cy.get(':nth-child(1) > .sc-jSMfEi').click()
      cy.get(':nth-child(3) > .vstack > :nth-child(1) > .chakra-checkbox__control').click()
      cy.get('.modal-footer > .active').click()
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(4000)
      cy.visit(`http://localhost:3000/${visits[0].id}/`)
      cy.contains('Vierailu on peruttu')
    })
  })

  it('filter events by sicence classes', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Suodata').click()
    cy.get(':nth-child(4) > .select__control > .select__value-container > .select__input-container')
      .click().type('SUM{enter}')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Kuukausi').click()
    cy.contains('Maanjäristysten').should('not.exist')
    cy.contains('Kemian').should('not.exist')
    cy.contains('Python').should('not.exist')
    cy.contains('Scratch').should('not.exist')
  })

  it('change language', () => {
    cy.visit('http://localhost:3000')
    cy.contains('EN').click()
    cy.contains('Month')
    cy.contains('Hide')
  })

})
