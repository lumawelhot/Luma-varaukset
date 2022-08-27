// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const body = (username, password) => ({
  url: 'http://localhost:3001/graphql',
  method: 'POST',
  body: {
    query: `
      mutation login {
        login (
          username: "${username}"
          password: "${password}"
        ) {
          value
        }
      }
    `
  }
})

Cypress.Commands.add('authorize', () => {
  cy.request(body('Employee', 'emp'))
    .then(({ body }) => {
      localStorage.setItem('app-token', body.data.login.value)
    })
})

Cypress.Commands.add('admin', () => {
  cy.request(body('Admin', 'salainen'))
    .then(({ body }) => {
      localStorage.setItem('app-token', body.data.login.value)
    })
})
