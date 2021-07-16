/* eslint-disable no-undef */
import { Given, When, Then/* , And */ } from 'cypress-cucumber-preprocessor/steps'
import { addDays, startOfWeek } from 'date-fns'

Given('Employee is logged in', () => {
  cy.login({ username: 'Admin', password: 'salainen' })
})

When('I navigate to the create event page', () => {
  cy.visit('http://localhost:3000/event')
})

When('valid information is entered', () => {
  cy.get('#title').type('Test event')
  cy.wait(500)
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click()
  cy.wait(100)
  cy.get(':nth-child(13) > .checkbox2 > input').click()
  cy.wait(100)
  cy.get(':nth-child(19) > label > input').click()
  const eventDate = addDays(startOfWeek(new Date()), 16).toISOString().slice(0,10)
  cy.get(':nth-child(1) > .control > .ant-picker > .ant-picker-input > input').click()
  cy.get(`td[title="${eventDate}"]`).click()
  cy.get(':nth-child(2) > .control > .ant-picker > .ant-picker-input > input').as('startTime').click()
  cy.get('.ant-picker-content').within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('08').click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('15').click()
  })
  cy.get('.ant-btn').eq(0).click()
  cy.get('@startTime').should('have.value', '08:15')
  cy.get(':nth-child(3) > .control > .ant-picker > .ant-picker-input > input').as('endTime').should('have.value', '16:00')
  cy.get('@endTime').click()
  cy.get('.ant-picker-content').eq(2).within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('09').scrollIntoView().click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('45').scrollIntoView().click()
  })
  cy.get('.ant-btn').eq(1).click()
  cy.get('@endTime').should('have.value', '09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
})

Then('an event is succesfully created and success toast is shown', () => {
  const toast = cy.get('.toast')
  toast.should('have.class', 'is-success')
  toast.should('have.text', 'Vierailu luotu')
})

When('too short a title is entered', () => {
  cy.get('#title').type('test')
  cy.get('.autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get('.autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2) > span').click()
  cy.wait(100)
  cy.get('input[name="remoteVisit"]').click()
  cy.wait(100)
  cy.get(':nth-child(8) > .checkbox2 > input').click()
  cy.wait(100)
  cy.get(':nth-child(14) > label > input').click()
  const eventDate = addDays(startOfWeek(new Date()), 16).toISOString().slice(0,10)
  cy.get(':nth-child(1) > .control > .ant-picker > .ant-picker-input > input').click()
  cy.get(`td[title="${eventDate}"]`).click()
  cy.get(':nth-child(2) > .control > .ant-picker > .ant-picker-input > input').as('startTime').click()
  cy.get('.ant-picker-content').within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('08').click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('15').click()
  })
  cy.get('.ant-btn').eq(0).click()
  cy.get('@startTime').should('have.value', '08:15')
  cy.get(':nth-child(3) > .control > .ant-picker > .ant-picker-input > input').as('endTime').should('have.value', '16:00')
  cy.get('@endTime').click()
  cy.get('.ant-picker-content').eq(2).within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('09').scrollIntoView().click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('45').scrollIntoView().click()
  })
  cy.get('.ant-btn').eq(1).click()
  cy.get('@endTime').should('have.value', '09:45')
  cy.get('#desc').type('Test description')
  cy.get('[type="submit"]').click()
})

Then('no event is created and an error toast is shown', () => {
  const toast = cy.get('.toast')
  toast.should('have.class', 'is-danger')
  toast.should('have.text', 'Vierailun luonti epäonnistui! Tarkista tiedot!')
})