/* eslint-disable no-undef */
import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'
import { set, addBusinessDays } from 'date-fns'

const eventDate = addBusinessDays(set(new Date(), { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }), 14)
const availableEvent = 'BOOKABLE'

it('Initialize tests', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: availableEvent,
    start: new Date(eventDate.setHours(9,0)),
    end: new Date(eventDate.setHours(15,0)),
    scienceClass: [1],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1],
    desc: 'Test event description',
  })
})

Given('Customer is on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('I navigate to desired events\' booking form', () => {
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
  cy.contains('BOOKABLE').click()
  cy.get('#booking-button').click()
})

And('I enter necessary information', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.get(':nth-child(2) > label > input').click()
  cy.get(':nth-child(5) > label > input').click()
  cy.get('#clientName').type('Teacher')
  cy.get('#schoolName').type('School')
  cy.get('#schoolLocation').type('Location')
  cy.get('#clientEmail').type('email@cypress.com')
  cy.get('#verifyEmail').type('email@cypress.com')
  cy.get('#clientPhone').type('+358 313131313')
  cy.get('#visitGrade').type('1. grade')
  cy.get('#participants').type(13)
  cy.get('.ant-picker-input > input').as('startTime').click()
  cy.get('.ant-picker-content').within(() => {
    cy.get('ul .ant-picker-time-panel-cell').contains('10').click()
    cy.get('ul:last-child .ant-picker-time-panel-cell').contains('00').click()
  })
  cy.get('.ant-btn').eq(0).click()
  cy.get('@startTime').should('have.value', '10:00')
  cy.get('.privacyPolicy > input').click()
  cy.get('.remoteVisitGuidelines > input').click()
  cy.get('#create').click()
})

Then('the event is booked', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.get('.content > .title').contains('BOOKABLE')
})

And('customer has booked an event', () => {

})

When('I enter to correct visits\' url', () => {

})

And('I click cancel button', () => {

})

Then('the visit is cancelled', () => {

})

When('I click filter button', () => {

})

And('I change filter options', () => {

})

And('I enter to agenda view', () => {

})

Then('correct events are shown', () => {

})