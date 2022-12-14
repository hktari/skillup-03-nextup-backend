import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerModule } from "./logger/logger.module";
import { ConfigModule } from "@nestjs/config";
import { EventModule } from "./event/event.module";
import { BookingModule } from "./booking/booking.module";
import { UserModule } from "./user/user.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";

import { TypeOrmModule } from "@nestjs/typeorm";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { EmailService } from "./common/services/email.service";
import { CommonModule } from "./common/common.module";
import { GeoModule } from './geo/geo.module';
import { LocationModule } from './location/location.module';
@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    EventModule,
    UserModule,
    BookingModule,
    DatabaseModule,
    AuthModule,
    CommonModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
