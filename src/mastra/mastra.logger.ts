import { MastraLogger } from '@mastra/core/logger'
import { PinoLogger } from 'nestjs-pino'

const LOG_LEVELS = ['debug', 'info', 'warn', 'error']
export class MastraLoggerWrapper extends MastraLogger {
  private readonly pinoLogger: PinoLogger
  private readonly logLevel: string

  constructor(pinoInstance: PinoLogger, logLevel: string = 'debug') {
    super()
    this.pinoLogger = pinoInstance
    this.logLevel = logLevel
    this.pinoLogger.info('MastraLoggerWrapper: MastraLoggerWrapper initialized with log level: %s', logLevel)
  }

  debug(message: string, args?: Record<string, unknown>): void {
    //if the log level is debug or greater, log the message
    if (LOG_LEVELS.indexOf(this.logLevel) <= LOG_LEVELS.indexOf('debug')) {
      this.pinoLogger.debug(args || {}, message)
    }
  }

  info(message: string, args?: Record<string, unknown>): void {
    if (LOG_LEVELS.indexOf(this.logLevel) <= LOG_LEVELS.indexOf('info')) {
      this.pinoLogger.info(args || {}, message)
    }
  }

  warn(message: string, args?: Record<string, unknown>): void {
    if (LOG_LEVELS.indexOf(this.logLevel) <= LOG_LEVELS.indexOf('warn')) {
      this.pinoLogger.warn(args || {}, message)
    }
  }

  error(message: string, args?: Record<string, unknown>): void {
    if (LOG_LEVELS.indexOf(this.logLevel) <= LOG_LEVELS.indexOf('error')) {
      this.pinoLogger.error(args || {}, message)
    }
  }
}
