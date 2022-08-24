if (process.env.NODE_ENV !== 'e2e') throw new Error('Only runnable by e2e tests')
const logger = require('../../logger')
// here we are not using db interface
const Email = require('../../models/email')
const Event = require('../../models/event')
const Extra = require('../../models/extra')
const Forms = require('../../models/forms')
const Group = require('../../models/group')
const Tag = require('../../models/tag')
const User = require('../../models/user')
const Visit = require('../../models/visit')
const { initializeDB } = require('../../services/dbsetup')

// Ensure that this cannot run on production environment
const initE2E = app => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reset endpoint should not run on production')
  }
  if (process.env.NODE_ENV === 'e2e') {
    logger.info('Activating reset endpoint')
    app.get('/reset', async (req, res) => {
      await Email.deleteMany({})
      await Event.deleteMany({})
      await Extra.deleteMany({})
      await Forms.deleteMany({})
      await Group.deleteMany({})
      await Tag.deleteMany({})
      await User.deleteMany({})
      await Visit.deleteMany({})
      await initializeDB()
      logger.info('DB reset')
      res.send('Reset')
    })
    app.get('/testdata', async (req, res) => {
      const visits = await Visit.find({ clientName: 'Ivalon Opettaja' })
      res.send({ visits })
    })
  }
}

module.exports = initE2E
