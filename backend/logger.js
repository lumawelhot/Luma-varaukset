const { createLogger, transports, format } = require('winston')
const { addColors } = require('winston/lib/winston/config')

const settings = {
  levels: {
    critical: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
  },
  format: format.combine(
    format.colorize(),
    format.timestamp({ format:'YY-MM-DD HH:mm:ss' }),
    format.printf(msg => `[${msg.level}] [${msg.timestamp}]: ${msg.message}`)
  )
}

addColors({
  critical: 'red',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  debug: 'blue',
})

const production = createLogger({
  ...settings,
  level: 'info',
  transports: [
    new transports.Console(),
    //new transports.File({ filename: 'logs/dump.log', maxsize: 10 * 1024 * 1024, maxFiles: 10 })
  ],
})

const development = createLogger({
  ...settings,
  level: 'debug',
  transports: [
    new transports.Console(),
  ],
})

module.exports = process.env.NODE_ENV === 'production' ? production : development
