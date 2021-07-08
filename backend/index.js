const app = require('./app')
const config = require('./utils/config')
const PORT = config.PORT || 3001

const cron = require('node-cron')

cron.schedule('0 7 * * *', () => {
  console.log('Running a task every day at 07:00')
  // Lähetä muistutukset
})

cron.schedule('0 18 * * *', () => {
  console.log('Running a task every day at 18:00')
  // Lähetä kiitokset päivän vierailuista
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})