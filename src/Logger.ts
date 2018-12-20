import { createLogger, transports } from 'winston'
export type LogLevel = 'error' | 'debug' | 'info'
export const getLogger = (level: LogLevel = 'error') => createLogger({
  transports: [new transports.Console({ level })]
})
