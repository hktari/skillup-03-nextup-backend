import {
  ConsoleLogger,
  Controller,
  Get,
  Inject,
  Logger,
  LoggerService,
} from "@nestjs/common";
import { AppService } from "./app.service";
import {
  ILoggerServiceToken,
  WinstonLoggerService,
} from "./logger/winston-logger.service";
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger
  ) {
    this.logger.setContext("AppController");
  }

  @Get()
  getHello(): string {
    this.logger.debug("hello debug");
    this.logger.error("hello error");
    return this.appService.getHello();
  }
}
