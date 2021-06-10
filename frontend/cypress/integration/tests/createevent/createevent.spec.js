/* eslint-disable no-undef */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I am on the create event page', () => {
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
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click().type('{esc}')
  cy.wait(100)
  cy.get('p > input').click()
  cy.get('.button > :nth-child(1)').click()
  cy.get('.dropdown > .dropdown-menu > .dropdown-content > :nth-child(3) > span').click()
  cy.get('.button > :nth-child(1)').click()
  cy.get('#scienceClass').select('SUMMAMUTIKKA')
  cy.get('#date').type('2021-01-31')
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
  cy.wait(2000)
})

Then('an event is succesfully created', () => {
  //cy.log(  cy.get('#title').type('Test event'))
  cy.containsEvent({ title: 'Test event', resourceId: 1 }).should('eq', true)
})

When('too short a title is entered', () => {
  cy.get('#title').type('test')
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click().type('{esc}')
  cy.wait(100)
  cy.get('p > input').click()
  cy.get('.button > :nth-child(1)').click()
  cy.get('.dropdown > .dropdown-menu > .dropdown-content > :nth-child(4) > span').click()
  cy.get('.button > :nth-child(1)').click()
  cy.get('#scienceClass').select('SUMMAMUTIKKA')
  cy.get('#date').type('2021-01-31')
  cy.get('#startTime').type('08:15')
  cy.get('#endTime').type('09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
  cy.wait(2000)
})

Then('no event is created and an error message is shown', () => {

  cy.containsEvent({ title: 'test', resourceId: 1 }).should('eq', false)
  //tähän luotava virheviestin tarkistus sitten, kun backend on korjattu se lähettämään
})