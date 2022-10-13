import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from '../src/user/entities/user.entity';
import { AuthModule } from '../src/auth/auth.module';
import { BookingModule } from '../src/booking/booking.module';
import { DatabaseModule } from '../src/database/database.module';
import { EventModule } from '../src/event/event.module';
import { LoggerModule } from '../src/logger/logger.module';
import { UserModule } from '../src/user/user.module';
import { ConfigModule } from '@nestjs/config'
import { UserService } from '../src/user/user.service';
import { expectEventEntity, expectPagedCollection, expectUserEntity, getAuthToken } from './common';

describe('Profile (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule, ConfigModule.forRoot({ envFilePath: 'test.env', isGlobal: true }), UserModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const userService = app.get(UserService)
        existingUser = await userService.findByEmail('existing.user@example.com')
        existingUser = JSON.parse(JSON.stringify(existingUser)) // convert to regular object instead of 'User' class

        // login
        accessToken = await getAuthToken(app, existingUser)
    });

    afterAll(() => {
        if (app) {
            app.close()
        }
    })

    describe('PUT /profile', () => {
        it('should return 401 when not authenticated', async () => {
            const response = await request(app.getHttpServer())
                .put('/profile')

            expect(response.statusCode).toBe(401)
        })

        it('should return 200 when valid request', async () => {
            const userUpdate = {
                firstName: 'Pehta',
                lastName: 'Ferlin',
                imageBase64: ''
            }

            const respone = await request(app.getHttpServer())
                .put('/profile')
                .auth(accessToken, { type: 'bearer' })
                .send(userUpdate)

            expect(respone.statusCode).toBe(200)
        })
    })

    describe('GET /profile', () => {
        it('should return 401 when not authenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/profile')

            expect(response.statusCode).toBe(401)
        })
        it('should return 200 and user entity', async () => {
            const response = await request(app.getHttpServer())
                .get('/profile')
                .auth(accessToken, { type: 'bearer' })

            expect(response.statusCode).toBe(200)
            expectUserEntity(response.body)
        })
    })

    describe('POST /profile/change-password', () => {
        it('should return 401 when not authenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/profile/change-password')
                .send({
                    oldPassword: 'secret',
                    newPassword: 'secret2'
                })

            expect(response.statusCode).toBe(401)
        })

        it('should return 400 when invalid value for field oldPassword', async () => {
            const invalidPayload = {
                oldPassword: 'wrong-secret',
                newPassword: 'secret2'
            }

            const response = await request(app.getHttpServer())
                .post('/profile/change-password')
                .auth(accessToken, { type: 'bearer' })
                .send(invalidPayload)

            expect(response.statusCode).toBe(400)
        })


        it('should return 200 when valid payload', async () => {
            const validPayload = {
                oldPassword: 'secret',
                newPassword: 'secret2'
            }

            const response = await request(app.getHttpServer())
                .post('/profile/change-password')
                .auth(accessToken, { type: 'bearer' })
                .send(validPayload)

            expect(response.statusCode).toBe(200)
        })
    })
});


