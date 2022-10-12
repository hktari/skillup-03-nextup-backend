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
import { expectEventEntity, expectPagedCollection, getAuthToken } from './common';

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
});


