import { format } from 'date-fns'

describe('As an employee I can', () => {
  const date = new Date()
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7 + 1) % 7 + 8)

  beforeEach(() => {
    cy.request('http://localhost:3001/reset')
    cy.authorize()
  })

  xit('create a new event', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Luo vierailu').click()
    cy.get('#title').type('Ihmeellinen avaruus')
    cy.get('#duration').clear().type('45')
    cy.get(':nth-child(16) > :nth-child(1) > .chakra-checkbox__control').click()
    cy.get(':nth-child(18) > :nth-child(4) > .chakra-checkbox__control').click()
    cy.get(':nth-child(21) > [style="width: 100%; margin-right: 15px;"]')
      .click().clear().type(format(date, 'dd.MM.yyyy'))
    cy.get('[style="margin-top: 40px;"] > .chakra-button').click()
    cy.get('[style="overflow: auto;"] > :nth-child(1)')
      .click().clear().type('10:00{enter}')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ihmeellinen avaruus')
  })

  xit('modify an event', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Kuukausi').click()
    cy.get('.event-overlay').first().click()
    cy.contains('Muokkaa vierailua').click()
    cy.get('#title').clear().type('Muokattu vierailu')
    cy.get('#desc').clear().type('Vierailun uskomaton kuvaus')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.wait(1000)
    cy.contains('Muokattu vierailu').click()
    cy.contains('Vierailun uskomaton kuvaus')
  })

  xit('delete an event', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Kuukausi').click()
    cy.get('.event-overlay').its('length').then(before => {
      cy.get('.event-overlay').first().click()
      cy.contains('Poista vierailu').click()
      cy.get('.event-overlay').its('length').then(after => {
        if (before !== after + 1) throw new Error('Event not deleted')
      })
    })
  })

  xit('create a new group', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Ryhmät').click()
    cy.contains('Lisää ryhmä').click()
    cy.get('#name').type('Kevään opinnot')
    cy.get('#maxCount').type('3')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ryhmän luominen onnistui')
    cy.contains('Kevään opinnot')
  })

  xit('modify a group', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Ryhmät').click()
    cy.contains('tr', 'Virtuaalikierros kampuksella').find('button').click()
    cy.get('#name').clear().type('Kierros kampuksella')
    cy.get('#maxCount').clear().type(1)
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ryhmän muokkaaminen onnistui')
    cy.contains('Kierros kampuksella')
  })

  xit('remove a group', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Ryhmät').click()
    cy.contains('Virtuaalikierros kampuksella')
    cy.get(':nth-child(2) > :nth-child(1) > .sc-hAZoDl').click()
    cy.contains('Poista valitut').click()
    cy.contains('Virtuaalikierros kampuksella').should('not.exist')
  })

  it('create a new extra', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Lisävalinnat').click()
  })

})