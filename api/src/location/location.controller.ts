import { BadRequestException, ConsoleLogger, Controller, Get, Inject, Query } from '@nestjs/common';
import { GeoService } from '../geo/geo.service';
import { ILoggerServiceToken } from '../logger/winston-logger.service';

@Controller('location')
export class LocationController {
    constructor(
        @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger,
        private readonly geoService: GeoService) { }


    @Get('/autocomplete')
    autocompleteQuery(@Query('text') text: string) {
        if (!text) {
            throw new BadRequestException()
        }

        return this.geoService.autocompleteQuery(text)
    }
}
