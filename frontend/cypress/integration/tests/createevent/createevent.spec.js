/* eslint-disable no-undef */
import { Given, When, Then/* , And */ } from 'cypress-cucumber-preprocessor/steps'
import { addDays, startOfWeek } from 'date-fns'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I navigate to the create event page', () => {
  cy.visit('http://localhost:3000/event')
})

Then('event form has a description field', () => {
  cy.get('textarea#desc')
    .should('exist')
    .and('be.visible')
    .and('have.attr', 'placeholder', 'Kirjoita tähän lyhyt kuvaus vierailusta.')
})

When('valid information is entered', () => {
  cy.get('#title').type('Test event')
  cy.wait(500)
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click()
  cy.wait(100)
  cy.get(':nth-child(2) > .checkbox2 > input').click()
  cy.wait(100)
  cy.get(':nth-child(3) > .checkbox3 > input').click()
  const eventDate = addDays(startOfWeek(new Date()), 16).toISOString().slice(0,10)
  cy.get('#date').type(eventDate)
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
})

Then('an event is succesfully created and success toast is shown', () => {
  const toast = cy.get('.toast')
  toast.should('have.class', 'is-success')
  toast.should('have.text', 'Vierailu luotu')
})

When('too short a title is entered', () => {
  cy.get('#title').type('test')
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click()
  cy.wait(100)
  cy.get('input[name="remoteVisit"]').click()
  cy.wait(100)
  cy.get(':nth-child(2) > .checkbox2 > input').click()
  cy.wait(100)
  cy.get(':nth-child(3) > .checkbox3 > input').click()
  const eventDate = addDays(startOfWeek(new Date()), 16).toISOString().slice(0,10)
  cy.get('#date').type(eventDate)
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
})

Then('no event is created and an error toast is shown', () => {
  const toast = cy.get('.toast')
  toast.should('have.class', 'is-danger')
  toast.should('have.text', 'Vierailun luonti epäonnistui! Tarkista tiedot!')
})