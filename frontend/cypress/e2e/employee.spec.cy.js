import { format } from 'date-fns'

describe('As an employee I can', () => {
  const date = new Date()
  // eslint-disable-next-line no-mixed-operators
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7) % 7 + 8)

  beforeEach(() => {
    cy.request('http://localhost:3001/reset')
    cy.authorize()
    cy.visit('http://localhost:3000')
  })

  it('create a new event', () => {
    cy.contains('Luo vierailu').click()
    cy.get('#title').type('Ihmeellinen avaruus')
    cy.get('#duration').clear().type('45')
    cy.get(':nth-child(16) > :nth-child(1) > .chakra-checkbox__control').click()
    cy.get(':nth-child(18) > :nth-child(4) > .chakra-checkbox__control').click()
    cy.get(':nth-child(21) > [style="width: 100%; margin-right: 15px;"]')
      .click().clear().type(format(date, 'dd.MM.yyyy'))
    cy.get('[style="margin-top: 40px;"] > .chakra-button').click()
    cy.get(':nth-child(24) > :nth-child(1) > :nth-child(1)')
      .click().clear().type('10:00{enter}')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ihmeellinen avaruus')
  })

  it('modify an event', () => {
    cy.contains('Kuukausi').click()
    cy.get('.event-overlay').first().click()
    cy.contains('Muokkaa vierailua').click()
    cy.get('#title').clear().type('Muokattu vierailu')
    cy.get('#desc').clear().type('Vierailun uskomaton kuvaus')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000)
    cy.contains('Muokattu vierailu').click()
    cy.contains('Vierailun uskomaton kuvaus')
  })

  it('delete an event', () => {
    cy.contains('Kuukausi').click()
    cy.get('.event-overlay').its('length').then(before => {
      cy.get('.event-overlay').first().click()
      cy.contains('Poista vierailu').click()
      cy.get('.event-overlay').its('length').then(after => {
        if (before !== after + 1) throw new Error('Event not deleted')
      })
    })
  })

  it('create a new group', () => {
    cy.contains('Ryhmät').click()
    cy.contains('Lisää ryhmä').click()
    cy.get('#name').type('Kevään opinnot')
    cy.get('#maxCount').type('3')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ryhmän luominen onnistui')
    cy.contains('Kevään opinnot')
  })

  it('modify a group', () => {
    cy.contains('Ryhmät').click()
    cy.contains('tr', 'Virtuaalikierros kampuksella').find('button').click()
    cy.get('#name').clear().type('Kierros kampuksella')
    cy.get('#maxCount').clear().type(1)
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Ryhmän muokkaaminen onnistui')
    cy.contains('Kierros kampuksella')
  })

  it('remove a group', () => {
    cy.contains('Ryhmät').click()
    cy.contains('Virtuaalikierros kampuksella')
    cy.get(':nth-child(2) > :nth-child(1) > .sc-hAZoDl').click()
    cy.contains('Poista valitut').click()
    cy.contains('Virtuaalikierros kampuksella').should('not.exist')
  })

  it('create a new extra', () => {
    cy.contains('Lisävalinnat').click()
    cy.contains('Luo uusi').click()
    cy.get('#name').type('Matematiikan työpaja')
    cy.get('#inPersonLength').type(15)
    cy.get('#remoteLength').type(10)
    cy.get(':nth-child(2) > .chakra-checkbox__control').click()
    cy.get(':nth-child(5) > .chakra-checkbox__control').click()
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Matematiikan työpaja')
  })

  it('modify an extra', () => {
    cy.contains('Lisävalinnat').click()
    cy.contains('tr', 'Tieteenalan esittely').find('button').click()
    cy.get('#name').clear().type('Kampus esittely')
    cy.get('.modal-footer > .sc-dkzDqf').click()
    cy.contains('Kampus esittely')
    cy.contains('Tieteenalan esittely').should('not.exist')
  })

  it('delete an extra', () => {
    cy.contains('Lisävalinnat').click()
    cy.contains('Aihekohtainen syvempi esittely ja osaston uusin tutkimus')
    cy.get(':nth-child(2) > :nth-child(1) > .sc-hAZoDl').click()
    cy.get(':nth-child(4) > :nth-child(1) > .sc-hAZoDl').click()
    cy.contains('Poista valitut').click()
    cy.contains('Opiskelijan elämää').should('not.exist')
    cy.contains('Aihekohtainen syvempi esittely ja osaston uusin tutkimus').should('not.exist')
  })

  it('create a new custom form', () => {
    cy.contains('Lomakkeet').click()
    cy.contains('Lisää uusi lomake').click()
    cy.get('#name').type('Linkin lomake')
    cy.get('#question').type('Kysymys 1')
    cy.get('[form="custom-add"]').click()
    cy.get(':nth-child(2) > .sc-jSMfEi').click()
    cy.get('#question').type('Kysymys 2')
    cy.get('[style="padding: 12px; margin-left: 5px;"]').click()
    cy.get(':nth-child(4) > .sc-ftvSup').type('bonus')
    cy.get('[form="custom-add"]').click()
    cy.get(':nth-child(3) > .sc-jSMfEi').click()
    cy.get('#question').type('Kysymys 3')
    cy.get('[form="custom-add"]').click()
    cy.contains('Kysymys 1')
    cy.contains('Kysymys 2')
    cy.contains('Kysymys 3')
    cy.get('.modal-footer > div > .active').click()
    cy.contains('Lomakkeen luominen onnistui')
    cy.contains('Linkin lomake')
  })

  it('modify a custom form', () => {
    cy.contains('Lomakkeet').click()
    cy.contains('tr', 'Summamutikan lomake').find('button').click()
    cy.contains('tr', 'Kysymys 3').find('button').eq(0).click()
    cy.get('#question').clear().type('Muokattu kysymys')
    cy.get('[form="custom-modify"]').click()
    cy.get('#name').clear().type('Muokattu lomake')
    cy.get('.modal-footer > div > .active').click()
    cy.contains('Lomakkeen muokkaaminen onnistui')
    cy.contains('Muokattu lomake')
    cy.contains('Summamutikan lomake').should('not.exist')
  })

  it('delete a form', () => {
    cy.contains('Lomakkeet').click()
    cy.get(':nth-child(2) > :nth-child(1) > .sc-hAZoDl').click()
    cy.contains('Gadolinin lomake')
    cy.contains('Poista valitut').click()
    cy.contains('Gadolinin lomake').should('not.exist')
  })

})
