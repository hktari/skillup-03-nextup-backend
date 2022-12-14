import logger from '../logger';
import ConfigService from './config.service';
import axios, { AxiosInstance } from 'axios';
import { BookingPendingReminder, Event, MongoDbQuery, MongoDbUpdateResult } from './database.interface';
import { transformParseDateFields } from './axios.util';

export default class DatabaseService {
    private httpClient: AxiosInstance;
    private apiEndpoint: string;
    private mongoDatabaseName: string;

    constructor(private configService: ConfigService) {
        this.apiEndpoint = this.configService.getOrThrow('MONGODB_DATA_API') as string;
        this.mongoDatabaseName = this.configService.getOrThrow('MONGODB_DATABASE') as string;
        const apiKey = this.configService.getOrThrow('MONGODB_DATA_API_KEY');

        logger.debug('event service endpoint: ' + this.apiEndpoint);

        logger.debug('event service api key' + apiKey);
        this.httpClient = axios.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': apiKey
            }
        });
        this.httpClient.interceptors.request.use(function (config) {
            // Do something before request is sent
            logger.debug('sending request to: ' + config.url);
            logger.debug('payload:' + JSON.stringify(config.data));
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });


        this.httpClient.defaults.transformResponse = [transformParseDateFields];
    }

    private createPayload() {
        return {
            'collection': 'user',
            'database': this.mongoDatabaseName,
            'dataSource': 'skillupmentor',
            'projection': { '_id': 1 }
        };
    }

    async getEvents(): Promise<MongoDbQuery<Event>> {
        const getAllUrl = `${this.apiEndpoint}/action/aggregate`;

        const payload = {
            'collection': 'user',
            'database': this.mongoDatabaseName,
            'dataSource': 'skillupmentor',
            'pipeline': [
                {
                    '$unwind': '$events'
                },
                {
                    '$replaceRoot': {
                        'newRoot': '$events'
                    }
                }
            ]
        };

        const response = await this.httpClient.post<MongoDbQuery<Event>>(getAllUrl, payload);
        return response.data;
    }

    async getBookingsForEventPendingReminder(eventId: string): Promise<MongoDbQuery<BookingPendingReminder>> {
        const getAllUrl = `${this.apiEndpoint}/action/aggregate`;

        const payload = {
            'collection': 'booking',
            'database': this.mongoDatabaseName,
            'dataSource': 'skillupmentor',
            'pipeline': [
                {
                    '$match': {
                        '$expr': {
                            '$eq': [
                                {
                                    '$toString': '$eventId'
                                },
                                eventId
                            ]
                        }
                    }
                },
                {
                    '$match': {
                        'reminderSentDatetime': {
                            '$exists': false
                        }
                    }
                },
                {
                    '$lookup': {
                        'from': 'user',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                },
                {
                    '$project': {
                        '_id': 1,
                        'eventId': 1,
                        'userId': 1,
                        'bookingId': 1,
                        'reminderSentDatetime': 1,
                        'user.email': 1
                    }
                }
            ]
        };

        const response = await this.httpClient.post<MongoDbQuery<BookingPendingReminder>>(getAllUrl, payload);
        return response.data;
    }


    async markBookingsReminderSent(bookings: BookingPendingReminder[]): Promise<MongoDbUpdateResult> {
        const updateManyUrl = `${this.apiEndpoint}/action/updateMany`;
        const updateManyPayload = {
            'collection': 'booking',
            'database': this.mongoDatabaseName,
            'dataSource': 'skillupmentor',
            'filter':
            {
                '$expr': {
                    '$or': bookings.map(book => {
                        return {
                            '$eq': [
                                {
                                    '$toString': '$_id'
                                },
                                book._id
                            ]
                        };
                    })
                }
            },
            'update': {
                '$set': {
                    'reminderSentDatetime': new Date().toISOString()
                }
            }
        };

        const response = await this.httpClient.post<MongoDbUpdateResult>(updateManyUrl, updateManyPayload);

        return response.data;
    }
    // async getUsersByIds(userIds: string[]){
    //     const getUsersUrl = `${this.apiEndpoint}/action/aggregate`

    //     const payload = {
    //         "collection": "user",
    //         "database": this.mongoDatabaseName,
    //         "dataSource": "skillupmentor",
    //         "filter": {
    //             "$expr": {
    //                 "$in":  [
    //                     {
    //                         "$toString": "$_id"
    //                     },
    //                     eventId
    //                 ]
    //             }
    //         }
    //     }

    //     const response = await this.httpClient.post(getAllUrl, payload)
    //     return response.data
    // }

}