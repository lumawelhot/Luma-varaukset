/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('I am on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('the user presses login key icon', () => {
  cy.get('.admin-button').click()
})

Then('the user is on the login page', () => {
  cy.get('.section > .title').should('have.text', 'Kirjautuminen (Luma-Varaukset)')
})

Given('I am on the login page', () => {
  cy.visit('http://localhost:3000/admin')
})

When('valid username and password are entered', () => {
  cy.get('#username').type('Admin')
  cy.get('#password').type('salainen')
  cy.get('#login').click()
})

Then('user is logged in', () => {
  cy.get('.rbc-active').should('have.text', 'Viikko')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(1)').should('have.text', 'Kuukausi')
})

When('valid username and invalid password are entered', () => {
  cy.get('#username').type('Admin')
  cy.get('#password').type('wrong')
  cy.get('#login').click()
})

Then('user is not logged in and error message is shown', () => {
  cy.get('.toast > div').should('have.text', 'Wrong credentials!')
})

Given('Admin is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I am on the login page', () => {
  cy.visit('http://localhost:3000/admin')
})

Then('an error is shown', () => {
  cy.get('.App > div').should('have.text', 'Olet jo kirjautunut sisään.')
})

When('I am on the main page', () => {
  cy.visit('http://localhost:3000')
})

Then('correct username is shown', () => {
  cy.contains('Olet kirjautunut käyttäjänä: Admin')
})
