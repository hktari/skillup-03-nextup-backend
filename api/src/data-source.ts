import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import { SeederOptions } from 'typeorm-extension';
import { Booking } from "./booking/entities/booking.entity";
import { User } from "./user/entities/user.entity";
import { Event } from "./event/entities/event.entity"

const options: DataSourceOptions & SeederOptions = {
    type: "mongodb",
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
    // host: "skillupmentor.3egsxni.mongodb.net",
    // username: "mongodb",
    // password: "S4XTxk6oavV4BZLPdgd",
    port: 27017,
    database: process.env.MONGODB_DATABASE,
    synchronize: false,
    logging: false,
    entities: [User, Event, Booking],
    subscribers: [],
    factories: ['src/db/data/factory/**/*.ts'],
    seeds: ['src/db/data/seed/**/*.ts'],
    migrations: ['src/db/migration/**/*.ts'],
    // cli: {
    //     entitiesDir: "src/entity",
    //     migrationsDir: "src/migration",
    //     subscribersDir: "src/subscriber"
    // }
}


export const AppDataSource = new DataSource(options);
