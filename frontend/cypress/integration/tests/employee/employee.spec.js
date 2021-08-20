/* eslint-disable no-undef */
import { And, Given, Then, When } from 'cypress-cucumber-preprocessor/steps'
import { addBusinessDays, addDays, startOfWeek } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

const setToHelsinkiTime = (dateString, timeString) => {
  const dateTimeString = dateString.slice(0,11) + timeString
  return zonedTimeToUtc(dateTimeString, 'Europe/Helsinki')
}

const eventDate1 = setToHelsinkiTime(addBusinessDays(new Date(), 14).toISOString(),'10:00')
const eventDate2 = setToHelsinkiTime(addBusinessDays(new Date(), 15).toISOString(),'10:00')
const eventDate3 = setToHelsinkiTime(addBusinessDays(new Date(), 16).toISOString(),'10:00')
const eventDate4 = setToHelsinkiTime(addBusinessDays(new Date(), 17).toISOString(),'10:00')
const bookedEvent1 = 'BOOKED1'
const bookedEvent2 = 'BOOKED2'
const bookedEvent3 = 'BOOKED3'
const availableEvent = 'NONBOOKED'

it('Initialize tests', () => {
  cy.request('http://localhost:3001/reset')
  cy.login({ username: 'Admin', password: 'salainen' })
  cy.createUser({ username: 'employeeUser', password: 'emp', isAdmin: false })
  cy.createEventWithVisit({
    title: bookedEvent1,
    start: setToHelsinkiTime(eventDate1.toISOString(),'11:00'),
    end: setToHelsinkiTime(eventDate1.toISOString(),'12:00'),
  })
  cy.createEventWithVisit({
    title: bookedEvent2,
    start: setToHelsinkiTime(eventDate2.toISOString(),'11:30'),
    end: setToHelsinkiTime(eventDate2.toISOString(),'15:00'),
  })
  cy.createEventWithVisit({
    title: bookedEvent3,
    start: setToHelsinkiTime(eventDate3.toISOString(),'13:00'),
    end: setToHelsinkiTime(eventDate3.toISOString(),'16:00'),
  })
  cy.createEvent({
    title: availableEvent,
    start: setToHelsinkiTime(eventDate4.toISOString(),'11:00'),
    end: setToHelsinkiTime(eventDate4.toISOString(),'15:00'),
    scienceClass: [1,3],
    remoteVisit: true,
    inPersonVisit: true,
    remotePlatforms: [1],
    desc: 'Test event description',
  })
})

Given('Employee is not logged in', () => {
  // This only describes that specific user is not logged in
})

When('I navigate to the login form', () => {
  cy.get('svg.admin-button').click()
})

And('I enter correct login credentials', () => {
  cy.get('#username').type('employeeUser')
  cy.get('#password').type('emp')
  cy.get('#login').click()
})

Then('I am logged in', () => {
  cy.get('.is-pulled-right').contains('Olet kirjautunut käyttäjänä: employeeUser')
})

Given('Employee is logged in', () => {
  cy.login({ username: 'employeeUser', password: 'emp' })
})

And('I enter incorrect password', () => {
  cy.get('#username').type('employeeUser')
  cy.get('#password').type('incorrect')
  cy.get('#login').click()
})

Then('I am not logged in', () => {
  cy.get('.toast').should('have.class', 'is-danger')
})

And('employee is on the main page', () => {
  cy.visit('http://localhost:3000')
})

When('I navigate to the event form', () => {
  cy.get(':nth-child(8) > :nth-child(1) > .button').click()
})

And('I enter all necessary information', () => {
  cy.get('#title').type('Created event')
  cy.get('#duration').clear().type(80)
  cy.get(':nth-child(4) > .taginput.control > .taginput-container > .autocomplete > .control > .input').type('Uusi tagi').type('{enter}')
  cy.get(':nth-child(4) > .taginput.control > .taginput-container > .autocomplete > .dropdown-menu > .dropdown-content > :nth-child(2)').click()
  cy.get(':nth-child(14) > .checkbox2 > input').click()
  cy.get(':nth-child(20) > label > input').click()
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

Then('event is successfully created', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
  cy.contains('Created event')
})

When('I am looking at the agenda view', () => {
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
})

Then('events are shown', () => {
  cy.contains('BOOKED1')
  cy.contains('BOOKED2')
  cy.contains('BOOKED3')
  cy.contains('NONBOOKED')
})

When('I navigate to visit list', () => {
  cy.get(':nth-child(8) > :nth-child(2) > .button').click()
})

Then('visits are shown on the page', () => {
  cy.contains('BOOKED1')
  cy.contains('BOOKED2')
  cy.contains('BOOKED3')
  cy.contains('NONBOOKED').should('not.exist')
})

When('I navigate to desired events\' page', () => {
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
  cy.contains('NONBOOKED').click()
})

And('I click modify event button', () => {
  cy.get(':nth-child(11) > :nth-child(1) > .button').click()
})

And('I modify desired fields', () => {
  cy.get('#desc').clear().type('New description')
  cy.get(':nth-child(20) > label > input').click()
  cy.get(':nth-child(21) > label > input').click()
  cy.get('.modal-card-foot > .luma').click()
})

Then('event information is modified successfully', () => {
  cy.get('.content > :nth-child(3) > :nth-child(1)').contains('New description')
  cy.get('.content > :nth-child(3) > :nth-child(1)').contains('event description').should('not.exist')
  cy.contains('SUMMAMUTIKKA').should('not.exist')
  cy.get('.content > :nth-child(3) > :nth-child(2)').contains('LINKKI')
})

And('I click remove button', () => {
  cy.get('#remove').click()
})

Then('event is removed successfully', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.contains('NONBOOKED').should('not.exist')
})

When('I navigate to booked events\' page', () => {
  cy.get('.rbc-toolbar > :nth-child(3) > :nth-child(4)').click()
  cy.contains('BOOKED1').click()
})

Then('event is not removed', () => {
  cy.get('.toast').should('have.class', 'is-danger')
  cy.contains('BOOKED1')
})

And('I navigate to form field creation page', () => {
  cy.get(':nth-child(8) > :nth-child(4) > .button').click()
  cy.get(':nth-child(1) > .button').click()
})

And('I design new custom fields', () => {
  cy.get('.input').clear().type('New custom form')
  cy.get('.level-left > .button').click()
  cy.get('.level-left > :nth-child(3)').click()
  cy.get(':nth-child(1) > .field-body > .input').clear().type('Is it summer now?')
  cy.get(':nth-child(3) > .field-body > :nth-child(2) > .input').clear().type('Yes')
  cy.get(':nth-child(4) > .field-body > :nth-child(2) > .input').clear().type('No')
  cy.get('[style="width: 35px;"]').click()
  cy.get(':nth-child(5) > .field-body > :nth-child(2) > .input').clear().type('I dont know')
  cy.get('.box > .button').click()
  cy.get('.level-left > .button').click()
  cy.get('.level-left > :nth-child(2)').click()
  cy.get('.box > :nth-child(1) > .control > .input').clear().type('Is this a question?')
  cy.get('.box > .button').click()
  cy.get(':nth-child(5) > .primary').click()
})

Then('the custom form is succesfully created', () => {
  cy.get('.toast').should('have.class', 'is-success')
  cy.get('tbody > tr > :nth-child(1)', { timeout: 6000 }).contains('New custom form')
  cy.get('[style="margin-right: 10px;"]').click()
  cy.get(':nth-child(1) > :nth-child(1) > .media > .field > label').contains('Is it summer now?')
  cy.get(':nth-child(2) > :nth-child(1) > .media > .field > label').contains('Is this a question?')
})