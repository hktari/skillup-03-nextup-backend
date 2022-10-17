
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/user/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';
import { BookingModule } from '../src/booking/booking.module';
import { DatabaseModule } from '../src/database/database.module';
import { EventModule } from '../src/event/event.module';
import { LoggerModule } from '../src/logger/logger.module';
import { UserModule } from '../src/user/user.module';
import { ConfigModule } from '@nestjs/config'
import { UserService } from '../src/user/user.service';
import { expectEventEntity, expectPagedCollection, getAuthToken } from './common';
import userFactory from '../src/db/data/factory/user.factory';
import { CreateEventDto } from '../src/event/dto/create-event.dto';
import { NextFunction } from 'express';
import { ILoggerServiceToken } from '../src/logger/winston-logger.service';
import { Request } from 'express'

describe('Event (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;
    let anotherUser: User;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule, ConfigModule.forRoot({ envFilePath: 'test.env', isGlobal: true }), UserModule, EventModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use((req: Request, res: Response, next: NextFunction) => {
            const logger = app.get(ILoggerServiceToken);
            logger.log(`[${req.method}]: ${req.originalUrl}`);
            next();
        })
        
        await app.init();

        const userService = app.get(UserService)
        existingUser = await userService.findByEmail('existing.user@example.com')
        existingUser = JSON.parse(JSON.stringify(existingUser)) // convert to regular object instead of 'User' class

        anotherUser = await userService.findByEmail('another.user@example.com')
        anotherUser = JSON.parse(JSON.stringify(anotherUser)) // convert to regular object instead of 'User' class


        // login
        accessToken = await getAuthToken(app, { email: 'existing.user@example.com', password: 'secret' })
    });

    afterAll(() => {
        if (app) {
            app.close()
        }
    })


    describe('GET /event', () => {
        it('should return a paginated collection of event objects', async () => {
            const response = await request(app.getHttpServer())
                .get('/event')

            expect(response.statusCode).toBe(200)
            expectPagedCollection(response.body)
            for (const event of response.body.items) {
                expectEventEntity(event, false)
            }
        })
    })


    describe('GET /event/featured', () => {
        it('should return an event object', async () => {
            const response = await request(app.getHttpServer())
                .get('/event/featured')

            expect(response.statusCode).toBe(200)
            expectEventEntity(response.body, false)
        })
    })


    describe('GET /event/{id}', () => {
        it('should return an event object with bookings field', async () => {
            const response = await request(app.getHttpServer())
                .get('/event/' + existingUser.events[0].eventId)

            expect(response.statusCode).toBe(200)
            expectEventEntity(response.body)
        })
    })


    describe('POST /event', () => {
        const newEventDto: CreateEventDto = {
            title: 'New Event',
            description: 'Event Description',
            datetime: new Date(),
            imageUrl: 'https://myimage.com',
            location: 'Richardson Street 45c, New Alabama 13212',
            max_users: 200
        }

        it('should return 401 when not authenicated', async () => {
            const response = await request(app.getHttpServer())
                .post('/event')
                .send(newEventDto)

            expect(response.statusCode).toBe(401)
        })

        it('should return 201 and event object', async () => {
            const response = await request(app.getHttpServer())
                .post('/event')
                .auth(accessToken, { type: 'bearer' })
                .send(newEventDto)

            expect(response.statusCode).toBe(201)
            expectEventEntity(response.body, false)
        })
    })


    describe('DELETE /event', () => {
        let existingEvent
        let forbiddenEvent

        beforeAll(() => {
            existingEvent = existingUser.events[0]
            forbiddenEvent = anotherUser.events[0]
        })

        it('should return 401 when not authenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/event/' + existingEvent.eventId)

            expect(response.statusCode).toBe(401)
        })


        it('should return 404 when event is not found', async () => {
            const response = await request(app.getHttpServer())
                .delete('/event/634d2137dd83e77ac5482d25')
                .auth(accessToken, { type: 'bearer' })

            expect(response.statusCode).toBe(404)
        })

        it('should return 404 when event is not owned by user', async () => {
            const response = await request(app.getHttpServer())
                .delete('/event/' + forbiddenEvent.eventId)
                .auth(accessToken, { type: 'bearer' })

            expect(response.statusCode).toBe(404)
        })

        it('should return 200 when valid request', async () => {
            const response = await request(app.getHttpServer())
                .delete('/event/' + existingEvent.eventId)
                .auth(accessToken, { type: 'bearer' })

            expect(response.statusCode).toBe(200)
        })
    })

});


    // DELETE /event (auth guard)
    // PUT /event (auth guard)

