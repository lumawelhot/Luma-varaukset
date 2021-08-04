/* eslint-disable no-undef */
import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'

it('Initialize tests', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createUser({ username: 'employee', password: 'secret', isAdmin: false })
})

Given('Admin is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

And('admin is on the main page', () => {
  cy.visit('http://localhost:3000')
})

Given('Employee is logged in', () => {
  cy.login({ username: 'employee', password: 'secret' })
})

And('employee is on the main page', () => {
  cy.visit('http://localhost:3000')
})

Given('Customer is on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('I am looking at the calendar view', () => {
  // This is only for describing situation
})

Then('I should see all buttons', () => {
  cy.contains('Olet kirjautunut käyttäjänä: Admin')
  cy.contains('Kirjaudu ulos')
  cy.contains('Luo uusi vierailu')
  cy.contains('Varaukset')
  cy.contains('Lisäpalvelut')
  cy.contains('Lomakkeet')
  cy.contains('Käyttäjälista')
  cy.contains('Vierailulista')
})

Then('I should see limited amount of buttons', () => {
  cy.contains('Olet kirjautunut käyttäjänä: employee')
  cy.contains('Kirjaudu ulos')
  cy.contains('Luo uusi vierailu')
  cy.contains('Varaukset')
  cy.contains('Lisäpalvelut')
  cy.contains('Lomakkeet')
  cy.contains('Käyttäjälista').should('not.exist')
  cy.contains('Vierailulista').should('not.exist')
})

Then('I should not see admin or employee related buttons', () => {
  cy.contains('Olet kirjautunut sisään käyttäjänä:').should('not.exist')
  cy.contains('Kirjaudu ulos').should('not.exist')
  cy.contains('Luo uusi vierailu').should('not.exist')
  cy.contains('Varaukset').should('not.exist')
  cy.contains('Lisäpalvelut').should('not.exist')
  cy.contains('Lomakkeet').should('not.exist')
  cy.contains('Käyttäjälista').should('not.exist')
  cy.contains('Vierailulista').should('not.exist')
})