import {
  LogLevel,
  Module,
  LoggerService,
  ConsoleLogger,
  Global,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ILoggerServiceToken,
  WinstonLoggerService,
} from "./winston-logger.service";

@Global()
@Module({
  providers: [
    {
      provide: ILoggerServiceToken,
      useFactory: (config: ConfigService) => {
        return new WinstonLoggerService(
          config.getOrThrow<boolean>("LOG_ROTATE")
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [ILoggerServiceToken],
})
export class LoggerModule {}
