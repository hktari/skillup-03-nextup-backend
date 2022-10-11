import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ILoggerServiceToken, WinstonLoggerService } from './logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useLogger(app.get(ILoggerServiceToken));

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
