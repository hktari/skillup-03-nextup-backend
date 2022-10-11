import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ILoggerServiceToken, WinstonLoggerService } from './logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useLogger(app.get(ILoggerServiceToken));

  await app.listen(3000);
}
bootstrap();
