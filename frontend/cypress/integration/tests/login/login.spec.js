/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('I am on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('the user presses login key icon', () => {
  cy.get('svg').click()
})

Then('the user is on the login page', () => {
  cy.get('.title').should('have.text', 'Luma varaukset kirjautuminen')
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
  cy.get('.rbc-active').should('have.text', 'Kuukausi')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(2)').should('have.text', 'Viikko')
})

When('valid username and invalid password are entered', () => {
  cy.get('#username').type('Admin')
  cy.get('#password').type('wrong')
  cy.get('#login').click()
})

Then('user is not logged in and error message is shown', () => {
  cy.get('div.label').should('have.text', 'Wrong credentials!')
})

Given('Admin is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I am on the login page', () => {
  cy.visit('http://localhost:3000/admin')
})

Then('an error is shown', () => {
  cy.get('.App > div').should('have.text', 'You are already logged in')
})

When('I am on the main page', () => {
  cy.visit('http://localhost:3000')
})

Then('correct username is shown', () => {
  cy.contains('Olet kirjautunut käyttäjänä: Admin')
})
