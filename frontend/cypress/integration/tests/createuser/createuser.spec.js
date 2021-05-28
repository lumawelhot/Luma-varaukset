import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

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
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(2000)
})

Then('a user is succesfully created', () => {
  cy.containsUser({ username: 'Tester' }).should('eq', true)
})


When('too short username is entered', () => {
  cy.get('#username').type('Test')
  cy.get('#password').type('secret')
  cy.get('#admin').click()
  cy.get('#create').click()
})

Then('a user is not created and an error message is shown', () => {
  cy.containsUser({ username: 'Test' }).should('eq', false)
  cy.get('div.label').should('have.text', 'username too short')
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

When('I enter to the user list page', () => {
  cy.visit('http://localhost:3000/users')
})

Then('the user list is shown', () => {
  cy.get('thead > tr > :nth-child(2)').should('have.text', 'Account type')
  cy.get('thead > tr > :nth-child(1)').should('have.text', 'Username')
})