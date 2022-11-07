import logger from '../logger'
import ConfigService from './config.service';
import axios, { AxiosInstance } from 'axios'

export default class EventService {
    private httpClient: AxiosInstance
    private apiEndpoint: string

    constructor(private configService: ConfigService) {
        this.apiEndpoint = this.configService.getOrThrow('MONGODB_DATA_API') as string
        const apiKey = this.configService.getOrThrow('MONGODB_DATA_API_KEY')
        logger.debug('event service endpoint: ' + this.apiEndpoint)

        logger.debug('event service api key' + apiKey)
        this.httpClient = axios.create({
            timeout: 3000,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': apiKey
            }
        });
        this.httpClient.interceptors.request.use(function (config) {
            // Do something before request is sent
            logger.debug('sending request to: ' + config.url)
            logger.debug('payload:' + JSON.stringify(config.data))
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });
    }

    private createPayload() {
        return {
            "collection": "user",
            "database": "skillupmentor-nextup03",
            "dataSource": "skillupmentor",
            "projection": { "_id": 1 }
        }
    }

    async getEvents() {
        const findOneUrl = `${this.apiEndpoint}/action/findOne`
        const response = await this.httpClient.post(findOneUrl, this.createPayload())
        return response.data
    }
}