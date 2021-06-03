/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

Given('I am on the create event page', () => {
  cy.visit('http://localhost:3000/event')
})

When('valid information is entered', () => {
  cy.get('#title').type('Test event')
  cy.get('.css-tj5bde-Svg').select('Varhaiskasvatus')
  cy.get('#scienceClass').select('SUMMAMUTIKKA')
  cy.get('#date').type('2021-01-31')
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#create').click()
  cy.wait(2000)
})

Then('an event is succesfully created', () => {
  cy.containsEvent({ title: 'Test event', resourceId: 1 }).should('eq', true)
})

When('too short a title is entered', () => {
  cy.get('#title').type('test')
  cy.get('#scienceClass').select('SUMMAMUTIKKA')
  cy.get('#date').type('2021-01-31')
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#create').click()
  cy.wait(2000)
})

Then('no event is created and an error message is shown', () => {
  cy.containsEvent({ title: 'test', resourceId: 1 }).should('eq', false)
  //tähän luotava virheviestin tarkistus sitten, kun backend on korjattu se lähettämään
})