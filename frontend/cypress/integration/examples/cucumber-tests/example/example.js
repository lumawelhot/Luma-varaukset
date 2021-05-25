import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('I am on the front page', () => {
  cy.visit('http://localhost:3000') // <- open the main url
})

When('I click on Viikko', () => {
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(2)').click() // <- check that this element is correct
})

Then('the week view is shown', () => {
  cy.get(':nth-child(2) > .rbc-row-resource > .rbc-header').should('have.text', 'Summamutikka') // <- check that this element is correct
})