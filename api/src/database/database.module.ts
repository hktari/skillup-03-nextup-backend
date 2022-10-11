import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Booking } from '../booking/entities/booking.entity';
import { User } from '../user/entities/user.entity';
import { Event } from "../event/entities/event.entity"

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: "mongodb",
                url: configService.getOrThrow<string>('MONGODB_URL'),
                useNewUrlParser: true,
                port: 27017,
                database: configService.getOrThrow<string>('MONGODB_DATABASE'),
                synchronize: false,
                logging: false,
                entities: [User, Event, Booking],
            }),
            inject: [ConfigService],
        })
    ],
    providers: [],
    exports: [TypeOrmModule.forFeature([User, Event, Booking])]
})
export class DatabaseModule {

}
