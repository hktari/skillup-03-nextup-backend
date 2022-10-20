import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { OsmAddress, OsmAutocompleteQuery } from './interface/osm.interface';
import { ConfigService } from '@nestjs/config'

const http = require('node:https');

@Injectable()
export class GeoService {
    constructor(
        @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger,
        private readonly configService: ConfigService) { }

    autocompleteQuery(text: string): Promise<OsmAutocompleteQuery> {
        return new Promise((resolve, reject) => {
            const apiKey = this.configService.getOrThrow('OSM_API_KEY')
            const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&apiKey=${apiKey}`

            http.get(url, res => {
                let rawData = ''

                res.on('data', chunk => {
                    rawData += chunk
                })

                res.on('end', () => {
                    const parsedData = JSON.parse(rawData)
                    resolve(parsedData)
                })

                res.on('error', (e) => {
                    this.logger.error(e);
                    reject(e)
                })
            })
        })
    }
}
