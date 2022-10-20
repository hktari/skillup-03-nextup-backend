import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
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
  getAuthToken,
  setupTestApp,
} from "./common";

describe("User (e2e)", () => {
  let app: INestApplication;
  let existingUser: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.forRoot({ envFilePath: "test.env", isGlobal: true }),
        UserModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    setupTestApp(app)
    
    await app.init();

    const userService = app.get(UserService);
    existingUser = await userService.findByEmail("existing.user@example.com");
    existingUser = JSON.parse(JSON.stringify(existingUser)); // convert to regular object instead of 'User' class

    // login
    accessToken = await getAuthToken(app, {
      email: "existing.user@example.com",
      password: "secret",
    });
  });

  afterAll(() => {
    if (app) {
      app.close();
    }
  });

  describe("GET /user/{id}", () => {
    it("should return 200 and existing user", async () => {
      const result = {
        ...existingUser,
      };
      delete result.password;

      const response = await request(app.getHttpServer()).get(
        "/user/" + existingUser.email
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject(result);
    });
  });

  describe("GET /user/upcoming-events", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app.getHttpServer()).get(
        "/user/upcoming-events"
      );

      expect(response.statusCode).toBe(401);
    });

    it("should return 200 and paginated collection of event objects", async () => {
      const response = await request(app.getHttpServer())
        .get("/user/upcoming-events")
        .auth(accessToken, { type: "bearer" });

      expect(response.statusCode).toBe(200);

      expectPagedCollection(response.body);

      for (const event of response.body.items) {
        expectEventEntity(event, false);
      }
    });
  });

  describe("GET /user/recent-events", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app.getHttpServer()).get(
        "/user/recent-events"
      );

      expect(response.statusCode).toBe(401);
    });

    it("should return 200 and paginated collection of event objects", async () => {
      const response = await request(app.getHttpServer())
        .get("/user/recent-events")
        .auth(accessToken, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expectPagedCollection(response.body);
      for (const item of response.body.items) {
        expectEventEntity(item, false);
      }
    });
  });
});
