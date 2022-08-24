const httpServer = require('./app')
const config = require('./config')
const { PORT } = config

const cron = require('node-cron')
const { sendReminder, sendThanks } = require('./utils/mailer/mailSender')
const logger = require('./logger')

cron.schedule('0 7 * * *', () => {
  logger.info('Running a task every day at 07:00')
  sendReminder()
  // Lähetä muistutukset
})

cron.schedule('0 18 * * *', () => {
  logger.info('Running a task every day at 18:00')
  sendThanks()
  // Lähetä kiitokset päivän vierailuista
})

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
