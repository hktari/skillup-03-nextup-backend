import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
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

describe("Profile (e2e)", () => {
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

  describe("PUT /profile", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app.getHttpServer()).put("/profile");

      expect(response.statusCode).toBe(401);
    });

    it("should return 200 when valid request", async () => {
      const userUpdate = {
        firstName: "Pehta",
        lastName: "Ferlin",
        imageBase64: "",
      };

      const respone = await request(app.getHttpServer())
        .put("/profile")
        .auth(accessToken, { type: "bearer" })
        .send(userUpdate);

      expect(respone.statusCode).toBe(200);
    });

    it('should return a different imageUrl when imageBase64 is given', async () => {      
      const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
      const lastImageUrl = existingUser.imageUrl
      const userUpdate = {
        imageBase64: `data:image/jpeg;base64,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`
      };

      const response = await request(app.getHttpServer())
        .put("/profile")
        .auth(accessToken, { type: "bearer" })
        .send(userUpdate);

      expect(response.body).toHaveProperty('imageUrl')
      expect(response.body.imageUrl).not.toBe(lastImageUrl)
      expect(response.body.imageUrl).toMatch(urlRegex)
    })
  });

  describe("GET /profile", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app.getHttpServer()).get("/profile");

      expect(response.statusCode).toBe(401);
    });
    it("should return 200 and user entity", async () => {
      const response = await request(app.getHttpServer())
        .get("/profile")
        .auth(accessToken, { type: "bearer" });

      expect(response.statusCode).toBe(200);
      expectUserEntity(response.body);
    });
  });

  describe("POST /profile/change-password", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app.getHttpServer())
        .post("/profile/change-password")
        .send({
          oldPassword: "secret",
          newPassword: "secret2",
        });

      expect(response.statusCode).toBe(401);
    });

    it("should return 400 when invalid value for field oldPassword", async () => {
      const invalidPayload = {
        oldPassword: "wrong-secret",
        newPassword: "secret2",
      };

      const response = await request(app.getHttpServer())
        .post("/profile/change-password")
        .auth(accessToken, { type: "bearer" })
        .send(invalidPayload);

      expect(response.statusCode).toBe(400);
    });

    it("should return 200 when valid payload", async () => {
      const validPayload = {
        oldPassword: "secret",
        newPassword: "secret2",
      };

      const response = await request(app.getHttpServer())
        .post("/profile/change-password")
        .auth(accessToken, { type: "bearer" })
        .send(validPayload);

      expect(response.statusCode).toBe(200);
    });
  });
});
