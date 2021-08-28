/* eslint-disable no-undef */
import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'
import { set, addMonths } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

const setToHelsinkiTime = (dateString, timeString) => {
  const dateTimeString = dateString.slice(0,11) + timeString
  return zonedTimeToUtc(dateTimeString, 'Europe/Helsinki')
}

const eventDate = setToHelsinkiTime(set(addMonths(new Date(), 1), { hours: 9, minutes: 0, seconds: 0 }).toISOString(),'10:00')
const availableEvent = 'BOOKABLE'
let id = null

it('Initialize tests', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createEvent({
    title: 'FILTER1',
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [1],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1, 2],
    grades: [1],
    desc: 'Test event description',
  }),
  cy.createEvent({
    title: 'FILTER2',
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [2],
    remoteVisit: true,
    inPersonVisit: false,
    remotePlatforms: [1],
    grades: [2, 3],
    desc: 'Test event description',
  })
  cy.createEvent({
    title: 'FILTER3',
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [2],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [2],
    grades: [2, 4],
    desc: 'Test event description',
  })
  cy.createEvent({
    title: 'FILTER4',
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [2],
    remoteVisit: false,
    inPersonVisit: true,
    remotePlatforms: [1],
    grades: [2, 5],
    desc: 'Test event description',
  })
  cy.createEvent({
    title: 'FILTER5',
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [1, 3, 5],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1],
    grades: [4, 5],
    desc: 'Test event description',
  })
  cy.createEvent({
    title: availableEvent,
    start: setToHelsinkiTime(eventDate.toISOString(), '09:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '15:00'),
    scienceClass: [1],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1],
    desc: 'Test event description',
  })
  cy.createEventWithVisit({
    title: 'Booked',
    start: setToHelsinkiTime(eventDate.toISOString(), '10:00'),
    end: setToHelsinkiTime(eventDate.toISOString(), '12:00'),
  }).then(value => id = value)
})

Given('Customer is on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('I navigate to desired events\' booking form', () => {
  cy.get('.fc-listMonth-button').click()
  cy.get('.fc-next-button').click()
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
  // This describes that the customer has booked the event with id
})

When('I enter to correct visits\' url', () => {
  cy.visit(`http://localhost:3000/${id}`)
})

And('I click cancel button', () => {
  cy.contains('Peru').click()
})

Then('the visit is cancelled', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.visit(`http://localhost:3000/${id}`)
  cy.contains('Varausta ei löytynyt.')
})

When('I click filter button', () => {
  cy.get('#filterButton > :nth-child(2)').click()
})

And('I change filter options', () => {
  cy.get(':nth-child(2) > .is-grouped > :nth-child(1) > .button').click()
  cy.get(':nth-child(2) > .is-grouped > :nth-child(3) > .button').click()
  cy.get(':nth-child(2) > .is-grouped > :nth-child(5) > .button').click()
  cy.get('.box > :nth-child(4) > :nth-child(2)').click()
  cy.get(':nth-child(6) > :nth-child(1) > .button').click()
})

And('I enter to agenda view', () => {
  cy.get('#filterButton > :nth-child(2)').click()
  cy.get('.fc-listMonth-button').click()
  cy.get('.fc-next-button').click()
})

Then('correct events are shown', () => {
  cy.contains('FILTER3')
  cy.contains('FILTER4')
  cy.contains('FILTER1').should('not.exist')
  cy.contains('FILTER2').should('not.exist')
  cy.contains('FILTER5').should('not.exist')
  cy.get('#filterButton').should('have.text', 'Suodata (3)')
})