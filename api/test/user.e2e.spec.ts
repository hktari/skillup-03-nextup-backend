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

describe('User (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule, ConfigModule.forRoot({ envFilePath: 'test.env', isGlobal: true }), UserModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const userService = app.get(UserService)
        existingUser = await userService.findByEmail('existing.user@example.com')
    });

    afterAll(() => {
        app.close()
    })

    describe('GET /user/{id}', () => {
        it('should return 200 and existing user', async () => {
            const response = await request(app.getHttpServer())
                .get('/user/' + existingUser.id)

            expect(response.statusCode).toBe(200)
            expect(response.body).toMatchObject(existingUser)
        })
    });

    // describe('GET /user/upcoming-events', () => {

    // })
    // describe('GET /user/recent-events', () => {

    // })
});


