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
  ],
})

const development = createLogger({
  ...settings,
  level: 'debug',
  transports: [
    new transports.Console(),
  ],
})

const test = createLogger({
  ...settings,
  level: 'error',
  transports: [
    new transports.Console()
  ]
})

const mode = process.env.NODE_ENV

module.exports = mode === 'production'
  ? production : (mode === 'development' || mode === 'docker'
    ? development : test)
