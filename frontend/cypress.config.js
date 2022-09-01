/* eslint-disable no-unused-vars */
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  retries: {
    runMode: 2,
    openMode: 2
  },
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
