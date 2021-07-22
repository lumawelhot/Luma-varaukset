const httpServer = require('./app')
const config = require('./utils/config')
const PORT = config.PORT || 3001

const cron = require('node-cron')
const { sendReminder, sendThanks } = require('./utils/mailSender')

cron.schedule('0 7 * * *', async () => {
  console.log('Running a task every day at 07:00')
  sendReminder()
  // Lähetä muistutukset
})

cron.schedule('0 18 * * *', async () => {
  console.log('Running a task every day at 18:00')
  sendThanks()
  // Lähetä kiitokset päivän vierailuista
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})