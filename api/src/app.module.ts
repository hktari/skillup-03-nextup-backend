import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [LoggerModule, ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
