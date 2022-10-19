import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
import { EmailService } from '../src/common/services/email.service';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;
    let accessToken: string;

    const mockEmailService = {
        sendPasswordReset: jest.fn()
            .mockImplementation((email: string, token: string) => {
                return Promise.resolve(true)
            })
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, ConfigModule.forRoot({ envFilePath: 'test.env', isGlobal: true })]
        }).overrideProvider(EmailService)
            .useFactory({
                factory: () => {
                    return mockEmailService;
                }
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.use((req: Request, res: Response, next: NextFunction) => {
            const logger = app.get(ILoggerServiceToken);
            logger.log(`[${req.method}]: ${req.originalUrl}`);
            next();
        })
        app.useGlobalPipes(new ValidationPipe())

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
            expectUserEntity(response.body, false)
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

    describe('POST /auth/password-reset', () => {
        it('should return 400 when invalid body', async () => {
            const response = request(app.getHttpServer())
                .post('/auth/password-reset')

            expect((await response).statusCode).toBe(400)
        })

        it("should return 200 when email doesn't exist", async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/password-reset')
                .send({
                    email: 'noexist@example.com'
                })

            expect(response.statusCode).toBe(200)
        })

        it('should return 200 when email exists and call EmailService', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/password-reset')
                .send({
                    email: 'existing.user@example.com'
                })

            expect(response.statusCode).toBe(200)
            expect(mockEmailService.sendPasswordReset).toHaveBeenCalled()
        })
    })

    describe('GET /auth/password-reset/:token', () => {
        it('should return 400 when invalid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/auth/password-reset/invalid-token')

            expect(response.statusCode).toBe(400)
        })

        it('should return 400 when token expired', async () => {
            const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4aXN0aW5nLnVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NjYxNzY0MjksImV4cCI6MTY2NjE3NjQyOX0.isjmWIgHgMz6E4WEDWjtA5OhcEZrg1EQec5k1acCLL4`
            const response = await request(app.getHttpServer())
                .get('/auth/password-reset/' + expiredToken)

            expect(response.statusCode).toBe(400)
        })
        it('should return 200 when valid token', async () => {
            const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4aXN0aW5nLnVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NjYxNzY0ODksImV4cCI6NDc5MDM3ODg4OX0.behAfgA1b_6gFbLhZXLMSLA0IOmuusACcFWDYT_VFhg`
            const response = await request(app.getHttpServer())
                .get('/auth/password-reset/' + validToken)

            expect(response.statusCode).toBe(200)
        })
    })

    describe('POST /auth/password-reset/:token', () => {
        it('should return 400 when invalid token', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/password-reset/invalid-token')

            expect(response.statusCode).toBe(400)
        })

        it('should return 400 when token expired', async () => {
            const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4aXN0aW5nLnVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NjYxNzY0MjksImV4cCI6MTY2NjE3NjQyOX0.isjmWIgHgMz6E4WEDWjtA5OhcEZrg1EQec5k1acCLL4`
            const response = await request(app.getHttpServer())
                .post('/auth/password-reset/' + expiredToken)

            expect(response.statusCode).toBe(400)
        })

        it('should return 200 when valid token and body', async () => {
            const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4aXN0aW5nLnVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NjYxNzY0ODksImV4cCI6NDc5MDM3ODg4OX0.behAfgA1b_6gFbLhZXLMSLA0IOmuusACcFWDYT_VFhg`
            const response = await request(app.getHttpServer())
                .get('/auth/password-reset/' + validToken)
                .send({
                    password: 'new-secret'
                })

            expect(response.statusCode).toBe(200)
        })
    })

});


