import { ConsoleLogger, Inject, Module } from '@nestjs/common';
import { GeoModule } from '../geo/geo.module';
import { GeoService } from '../geo/geo.service';
import { LoggerModule } from '../logger/logger.module';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { LocationController } from './location.controller';

@Module({
  imports: [GeoModule],
  controllers: [LocationController]
})
export class LocationModule {

}
