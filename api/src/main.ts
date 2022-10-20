import { ConfigService } from '@nestjs/config'
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { json } from "express";
import { AppModule } from "./app.module";
import {
  ILoggerServiceToken,
  WinstonLoggerService,
} from "./logger/winston-logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useLogger(app.get(ILoggerServiceToken));

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService)
  app.use(json({ limit: configService.get<string>('MAX_REQUEST_SIZE') ?? '10mb' }));

  await app.listen(3000);
}
bootstrap();
