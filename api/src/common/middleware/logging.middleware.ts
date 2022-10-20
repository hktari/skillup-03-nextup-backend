import {
  ConsoleLogger,
  Inject,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ILoggerServiceToken } from "../../logger/winston-logger.service";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`[${req.method}]: ${req.originalUrl}`);
    next();
  }
}
