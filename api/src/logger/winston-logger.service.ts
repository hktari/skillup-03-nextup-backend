import { LoggerService, Injectable, ConsoleLogger, LogLevel, Scope } from '@nestjs/common';

import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


export const ILoggerServiceToken = Symbol("ILoggerService");

@Injectable()
export class WinstonLoggerService extends ConsoleLogger {
    private readonly winston: winston.Logger

    constructor(private readonly useFileRotate: boolean) {
        super()

        const transports: winston.transport[] = [
        ]

        if (this.useFileRotate) {
            transports.push(new DailyRotateFile({
                filename: `logs/%DATE%.log`,
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: false,
                maxSize: '20m',
                maxFiles: '14d',
                format: winston.format.json(),
            }));
        }

        this.winston = winston.createLogger({
            level: 'debug',
            transports,
        });
    }


    log(message: string) {
        super.log(message)

        if (this.winston) {
            this.winston.log({
                level: 'info',
                timestamp: new Date().toISOString(),
                message,
                context: this.context
            })
        }
    }

    warn(message: any) {
        super.warn(message)

        if (this.winston) {
            this.winston.log({
                level: 'warn',
                timestamp: new Date().toISOString(),
                message,
                context: this.context
            })
        }
    }
    verbose(message: any) {
        super.verbose(message)
        if (this.winston) {
            this.winston.log({
                level: 'verbose',
                timestamp: new Date().toISOString(),
                message,
                context: this.context
            })
        }
    }
    debug(message: string) {
        super.debug(message)
        if (this.winston) {
            this.winston.log({
                level: 'debug',
                timestamp: new Date().toISOString(),
                message,
                context: this.context
            })
        }
    }
    error(message: any, stack: string) {
        super.error(message, stack)
        if (this.winston) {
            this.winston.log({
                level: 'error',
                timestamp: new Date().toISOString(),
                message,
                context: this.context
            })
        }
    }
}
