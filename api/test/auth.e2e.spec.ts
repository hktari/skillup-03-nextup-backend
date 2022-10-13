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
import { SignupDto } from '../src/auth/dto/signup.dto';
import { LoggingMiddleware } from '../src/common/middleware/logging.middleware';
import { NextFunction } from 'express';
import { ILoggerServiceToken } from '../src/logger/winston-logger.service';
import { Request } from 'express'

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;
    let accessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, ConfigModule.forRoot({ envFilePath: 'test.env', isGlobal: true })]
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use((req: Request, res: Response, next: NextFunction) => {
            const logger = app.get(ILoggerServiceToken);
            logger.log(`[${req.method}]: ${req.originalUrl}`);
            next();
        })

        await app.init();
    });

    afterAll(() => {
        if (app) {
            app.close()
        }
    })
    describe('signup', () => {
        it('should return 400 when email exists', async () => {
            const invalidPayload: SignupDto = {
                email: 'existing.user@example.com',
                password: 'secret',
                firstName: 'joža',
                lastName: 'mošt'
            }

            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send(invalidPayload)

            expect(response.statusCode).toBe(400)
        })

        it('should return 200 and user object when valid email', async () => {
            const validPayload: SignupDto = {
                email: 'new.user@example.com',
                password: 'secret',
                firstName: 'joža',
                lastName: 'mošt'
            }
            const response = await request(app.getHttpServer())
                .post('/auth/signup')
                .send(validPayload)

            expect(response.statusCode).toBe(201)
            expectUserEntity(response.body)
        })
    })

    describe('login', () => {
        it('should return 400 when invalid credentials', async () => {
            const invalidPayload = {
                email: 'new.user@example.com',
                password: 'wrong-secret'
            }

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidPayload)

            expect(response.statusCode).toBe(400)
        })

        it('should return 200 when valid credentials', async () => {
            const validPayload = {
                email: 'new.user@example.com',
                password: 'secret'
            }

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(validPayload)

            expect(response.statusCode).toBe(200)

        })
    })
});


