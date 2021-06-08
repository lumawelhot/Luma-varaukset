/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000')
})

When('I click on an available event', () => {
  cy.contains('Python-ohjelmointikieli').click()
})

Then('event page has the correct title', () => {
  cy.contains('Python-ohjelmointikieli')
  
})

And('event page has the correct start date', () => {
  cy.contains('Tapahtuma alkaa: 03.07.2021, 08:00')
})

And('event page contains booking button', () => {
    cy.contains('Varaa tapahtuma')
  })

Given('I am on an event page', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Python-ohjelmointikieli').click()
})

When('I click the booking button', () => {
    cy.contains('Varaa tapahtuma').click()
})

Then('booking form opens', () => {
    cy.get('#clientName')
    .should('exist')
    .and('be.visible')
})
