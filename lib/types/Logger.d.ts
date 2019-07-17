export declare type LogLevel = 'error' | 'debug' | 'info';
export declare const getLogger: (level?: LogLevel) => import("winston").Logger;
