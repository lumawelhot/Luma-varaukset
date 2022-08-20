const httpServer = require('./app')
const config = require('./config')
const { PORT } = config

const cron = require('node-cron')
const { sendReminder, sendThanks } = require('./utils/mailer/mailSender')

cron.schedule('0 7 * * *', () => {
  console.log('Running a task every day at 07:00')
  sendReminder()
  // Lähetä muistutukset
})

cron.schedule('0 18 * * *', () => {
  console.log('Running a task every day at 18:00')
  sendThanks()
  // Lähetä kiitokset päivän vierailuista
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
