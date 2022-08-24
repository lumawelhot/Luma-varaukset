describe('As a admin I can', () => {

  beforeEach(() => {
    cy.request('http://localhost:3001/reset')
    cy.admin()
  })

  it('create a new user', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Käyttäjälista').click()
    cy.contains('Luo käyttäjä').click()
    cy.get('#username').type('Alice')
    cy.get('#password').type('secret123')
    cy.get('#confirm').type('secret123')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Käyttäjän luominen onnistui')
    cy.contains('Alice')
  })

  it('can modify a user', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Käyttäjälista').click()
    cy.contains('Muokkaa käyttäjää').click()
    cy.get('#username').clear().type('Alice')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Käyttäjän muokkaaminen onnistui')
    cy.contains('Alice')
  })

  it('can remove a user', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Käyttäjälista').click()
    cy.get('.sc-ksZaOG > .chakra-checkbox > .chakra-checkbox__control').click()
    cy.contains('Poista valitut').click()
    cy.contains('Employee').should('not.exist')
    cy.contains('Admin')
  })

  it('can modify email templates', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Asetukset').click()
    cy.contains('Sähköpostipohjat').click()
    cy.contains('tr', 'Kiitokset tiedevierailusta').find('button').click()
    cy.get('#subject').clear().type('Kiitokset osallistumisestasi vierailuun')
    cy.get('#text').clear().type('Kiitoskäynnin aihe')
    cy.get('#html').clear().type('<div>Kiitoskäynnin aihe</div>')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Kiitokset osallistumisestasi vierailuun')
    cy.contains('tr', 'Kiitokset osallistumisestasi vierailuun').find('button').click()
  })

})