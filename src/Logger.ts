import { createLogger, transports } from 'winston'
export type LogLevel = 'error' | 'debug' | 'info'
let envLog = process.env['DC_LOG_LEVEL'] || ''
envLog = envLog.toLowerCase()
if (!(envLog === 'error' ||
    envLog === 'debug' ||
    envLog === 'info')) {
  envLog = ''
}
const logLevel: LogLevel = envLog as LogLevel || 'error'

export const getLogger = (level: LogLevel = logLevel) => {
  return createLogger({
    transports: [new transports.Console({ level })]
  })
}
