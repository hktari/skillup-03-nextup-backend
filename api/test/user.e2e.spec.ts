import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/user/entities/user.entity';

describe('User (e2e)', () => {
    let app: INestApplication;
    let existingUser: User;
    
    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();


        
    });

    describe('GET /user/{id}', () => {
        it('should return 200 and existing user', async () => { 
            const response = await request(app.getHttpServer())
                                    .get('/user/')
                                    
         })
    });

    describe('GET /user/upcoming-events', () => {

    })
    describe('GET /user/recent-events', () => {

    })
});


