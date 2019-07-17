"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
exports.getLogger = (level = 'error') => winston_1.createLogger({
    transports: [new winston_1.transports.Console({ level })]
});
