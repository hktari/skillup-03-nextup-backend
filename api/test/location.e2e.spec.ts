import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { User } from "../src/user/entities/user.entity";
import { AuthModule } from "../src/auth/auth.module";
import { BookingModule } from "../src/booking/booking.module";
import { DatabaseModule } from "../src/database/database.module";
import { EventModule } from "../src/event/event.module";
import { LoggerModule } from "../src/logger/logger.module";
import { UserModule } from "../src/user/user.module";
import { ConfigModule } from "@nestjs/config";
import { UserService } from "../src/user/user.service";
import {
  expectEventEntity,
  expectPagedCollection,
  expectUserEntity,
  getAuthToken,
  setupTestApp,
} from "./common";
import { SignupDto } from "../src/auth/dto/signup.dto";
import { LoggingMiddleware } from "../src/common/middleware/logging.middleware";
import { NextFunction } from "express";
import { ILoggerServiceToken } from "../src/logger/winston-logger.service";
import { Request } from "express";
import { EmailService } from "../src/common/services/email.service";

describe("Location (e2e)", () => {
  let app: INestApplication;
  let existingUser: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({ envFilePath: "test.env", isGlobal: true }),
      ],
    })
      .compile();

    app = moduleFixture.createNestApplication();

    setupTestApp(app)

    await app.init();
  });

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe('GET /location/autocomplete?text={}', () => {
    it('should return 400 when no query parameter is given', async () => {
      const response = await request(app.getHttpServer())
        .get('/location/autocomplete')

      expect(response.statusCode).toBe(400)
    })

    it('should return 200 and OsmAutocompleteQuery object', async () => {
      const searchText = 'Mosco'
      const result = JSON.parse(`{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Moscow","city":"Moscow","state":"Moscow","country":"Russia","country_code":"ru","lon":37.6174943,"lat":55.7504461,"formatted":"Moscow, Russia","address_line1":"Moscow","address_line2":"Russia","category":"populated_place","timezone":{"name":"Europe/Moscow","offset_STD":"+03:00","offset_STD_seconds":10800,"offset_DST":"+03:00","offset_DST_seconds":10800,"abbreviation_STD":"MSK","abbreviation_DST":"MSK"},"result_type":"city","rank":{"importance":0.7908193282833463,"confidence":1,"confidence_city_level":1,"match_type":"full_match"},"place_id":"51b3fb9f0d0acf4240599374289e0ee04b40f00101f901fdfc260000000000c002089203064d6f73636f77"},"geometry":{"type":"Point","coordinates":[37.6174943,55.7504461]},"bbox":[37.290502,55.4913076,37.9674277,55.9577717]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Mosco","suburb":"Mosco","county":"Kutum","state":"North Darfur State","country":"Sudan","country_code":"sd","hamlet":"Mosco","lon":24.1869112,"lat":14.4885284,"formatted":"Mosco, North Darfur State, Sudan","address_line1":"Mosco","address_line2":"North Darfur State, Sudan","category":"populated_place","timezone":{"name":"Africa/Khartoum","offset_STD":"+02:00","offset_STD_seconds":7200,"offset_DST":"+02:00","offset_DST_seconds":7200,"abbreviation_STD":"CAT","abbreviation_DST":"CAT"},"result_type":"suburb","rank":{"importance":0.25,"confidence":1,"confidence_city_level":1,"match_type":"full_match"},"place_id":"5191419369d92f3840599c55fa6420fa2c40f00103f9011f2b033a02000000c002059203054d6f73636f"},"geometry":{"type":"Point","coordinates":[24.1869112,14.4885284]},"bbox":[24.1669112,14.4685284,24.2069112,14.5085284]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Moscosi","city":"Moscosi","county":"Macerata","state":"Marche","postcode":"62021","country":"Italy","country_code":"it","village":"Moscosi","lon":13.1438303,"lat":43.3517033,"state_code":"MAR","formatted":"62021 Moscosi MC, Italy","address_line1":"Moscosi","address_line2":"62021 Moscosi MC, Italy","county_code":"MC","category":"populated_place","timezone":{"name":"Europe/Rome","offset_STD":"+01:00","offset_STD_seconds":3600,"offset_DST":"+02:00","offset_DST_seconds":7200,"abbreviation_STD":"CET","abbreviation_DST":"CEST"},"result_type":"postcode","rank":{"importance":0.275,"confidence":1,"confidence_city_level":1,"match_type":"full_match"},"place_id":"5105590520a4492a405998b21d9d04ad4540f00103f90110e7351600000000c002079203074d6f73636f7369"},"geometry":{"type":"Point","coordinates":[13.1438303,43.3517033]},"bbox":[13.1238303,43.3317033,13.1638303,43.3717033]},{"type":"Feature","properties":{"datasource":{"sourcename":"openstreetmap","attribution":"© OpenStreetMap contributors","license":"Open Database License","url":"https://www.openstreetmap.org/copyright"},"name":"Moscovei","city":"Moscovei","district":"Cahul District","country":"Moldova","country_code":"md","village":"Moscovei","lon":28.3734447,"lat":45.9125628,"county":"Cahul District","formatted":"Cahul District, Moscovei, Moldova","address_line1":"Cahul District","address_line2":"Moscovei, Moldova","category":"populated_place","timezone":{"name":"Europe/Chisinau","offset_STD":"+02:00","offset_STD_seconds":7200,"offset_DST":"+03:00","offset_DST_seconds":10800,"abbreviation_STD":"EET","abbreviation_DST":"EEST"},"result_type":"suburb","rank":{"importance":0.275,"confidence":1,"confidence_city_level":1,"match_type":"full_match"},"place_id":"51525d65129a5f3c4059eac59adbcef44640f00103f901bff8551000000000c002059203084d6f73636f766569"},"geometry":{"type":"Point","coordinates":[28.3734447,45.9125628]},"bbox":[28.3534447,45.8925628,28.3934447,45.9325628]}],"query":{"text":"Mosco","parsed":{"city":"mosco","expected_type":"unknown"}}}`)
      const response = await request(app.getHttpServer())
        .get('/location/autocomplete?text=' + searchText)

      expect(response.statusCode).toBe(200)
      expect(response.body).toEqual(expect.objectContaining(result))
    })
  })
});
