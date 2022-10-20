import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { GeoService } from './geo.service';

@Module({
  imports: [LoggerModule],
  providers: [GeoService]
})
export class GeoModule { }
