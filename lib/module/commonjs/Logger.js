"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let logger = null;
exports.getLogger = () => logger;
exports.setLogger = (newLogger) => {
    logger = newLogger;
};
