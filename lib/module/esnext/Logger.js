import { createLogger, transports } from 'winston';
export const getLogger = (level = 'error') => createLogger({
    transports: [new transports.Console({ level })]
});
