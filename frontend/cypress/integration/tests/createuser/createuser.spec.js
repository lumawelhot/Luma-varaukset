/* eslint-disable no-undef */
import { Given, When, Then, And } from 'cypress-cucumber-preprocessor/steps'

Given('Admin is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Given('I am on the create user page', () => {
  cy.visit('http://localhost:3000/users/create')
})

When('valid information are entered', () => {
  cy.get('#username').type('Tester')
  cy.get('#password').type('secret')
  cy.get('#admin').click()
  cy.get('#create').click()
  cy.wait(2000)
})

Then('a user is succesfully created', () => {
  cy.containsUser({ username: 'Tester' }).should('eq', true)
  cy.get('.toast > div').should('have.text', 'Käyttäjätunnus \'Tester\' luotu.')
})


When('too short username is entered', () => {
  cy.get('#username').type('Test')
  cy.get('#password').type('secret')
  cy.get('#admin').click()
  cy.get('#create').click()
})

Then('a user is not created and an error message is shown', () => {
  cy.containsUser({ username: 'Test' }).should('eq', false)
  cy.get('.toast > div').should('have.text', 'username too short')
})

Given('Employee is logged in', () => {
  cy.login({ username: 'Employee', password: 'emp' })
})

When('the employee enters to correct URL', () => {
  cy.visit('http://localhost:3000/users/create')
})

Then('an error is shown', () => {
  cy.get('.App > div').should('have.text', 'Access denied')
})

Given('a user is created', () => {
  cy.createUser({ username: 'xxxxx', password: 'supersecret', isAdmin: false })
})

And('I am on the list user page', () => {
  cy.visit('http://localhost:3000/users')
})

Then('the created user xxxxx is listed', () => {
  cy.get('thead > tr > :nth-child(2)').should('have.text', 'Oikeudet')
  cy.get('thead > tr > :nth-child(1)').should('have.text', 'Käyttäjätunnus')
  cy.get(':nth-child(4) > :nth-child(1)').should('have.text', 'xxxxx')
})

When('I press the user list button', () => {
  cy.get('.App > :nth-child(4) > :nth-child(2)').click()
})

Given('I am on the user list page', () => {
  cy.visit('http://localhost:3000/users')
})

When('I press create user button', () => {
  cy.get(':nth-child(1) > .button').click()
})

Then('the user creation page is shown', () => {
  cy.get(':nth-child(3) > .label').should('have.text', 'Käyttäjärooli')
})