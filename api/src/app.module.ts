import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [LoggerModule, ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }), EventModule, UserModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
