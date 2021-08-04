/* eslint-disable no-undef */
import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'

Given('Admin is not logged in', () => {
  // This only describes that specific user is not logged in
})

And('admin is on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('I navigate to the login form', () => {
  cy.get('svg.admin-button').click()
})

And('I enter correct login credentials', () => {
  cy.get('#username').type('Admin')
  cy.get('#password').type('salainen')
  cy.get('#login').click()
})

And('I enter incorrect password', () => {
  cy.get('#username').type('Admin')
  cy.get('#password').type('incorrect')
  cy.get('#login').click()
})

Then('I am not logged in', () => {
  cy.get('.toast').should('have.class', 'is-danger')
})

Then('I am logged in', () => {
  cy.get('.is-pulled-right').contains('Olet kirjautunut käyttäjänä: Admin')
})

Given('Admin is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I navigate to the user creation form', () => {
  cy.get(':nth-child(8) > :nth-child(5) > .button').click()
  cy.get(':nth-child(1) > .button').click()
})

And('I enter new user credentials', () => {
  cy.get('#username').type('User123')
  cy.get('#password').type('secret')
  cy.get('[style="margin-bottom: 10px;"] > label > input').click()
  cy.get('#create').click()
})

Then('the user is created', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.get(':nth-child(8) > :nth-child(5) > .button').click()
  cy.contains('User123')
})

When('I navigate to the user list page', () => {
  cy.get(':nth-child(8) > :nth-child(5) > .button').click()
})

And('I click user deletion button', () => {
  cy.get(':nth-child(3) > :nth-child(3) > .button').click()
})

Then('the user is deleted', () => {
  cy.get('.toast').should('have.class', 'is-success')
})

And('I choose the user which password I want to change', () => {
  cy.get(':nth-child(2) > :nth-child(4) > .button').click()
})

And('I enter users\' new password', () => {
  cy.get('#password').type('uusisecret')
  cy.get('#confirm').type('uusisecret')
  cy.get('.modal-card-foot > .luma').click()
})

Then('the password of the specific user is changed', () => {
  cy.get('.toast').should('have.class', 'is-success')
})