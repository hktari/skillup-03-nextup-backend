import { NestApplication } from "@nestjs/core";
import { NextFunction, json } from "express";
import * as request from "supertest";
import { ILoggerServiceToken } from "../src/logger/winston-logger.service";
import { User } from "../src/user/entities/user.entity";
import { Request } from "express";
import { INestApplication, ValidationPipe } from "@nestjs/common";

export const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/


export function getAuthToken(
  app,
  { email, password }: { email: string; password: string }
) {
  const validCredentials = {
    email,
    password,
  };
  return request(app.getHttpServer())
    .post("/auth/login")
    .send(validCredentials)
    .then((res) => res.body.access_token);
}

export function setupTestApp(app: INestApplication) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const logger = app.get(ILoggerServiceToken);
    logger.log(`[${req.method}]: ${req.originalUrl}`);
    next();
  });
  app.useGlobalPipes(new ValidationPipe());

  app.use(json({ limit: '10mb' }));
}

/* ------------------------------- // utility ------------------------------- */
export function expectUserEntity(user: any, expectRelations = true) {
  expect(user).toHaveProperty("firstName");
  expect(user).toHaveProperty("lastName");
  expect(user).toHaveProperty("email");
  expect(user).not.toHaveProperty("password");
  expect(user).toHaveProperty("imageUrl");
  if (expectRelations) {
    expect(user).toHaveProperty("events");
  }
}

export function expectEventEntity(event: any, expectRelations = true) {
  expect(event).toHaveProperty("title");
  expect(event).toHaveProperty("description");
  expect(event).toHaveProperty("location");
  expect(event).toHaveProperty("max_users");
  expect(event).toHaveProperty("imageUrl");
  if (expectRelations) {
    expect(event).toHaveProperty("bookings");
  }
}

export function expectPagedCollection(pagedCollection: any) {
  expect(pagedCollection).toHaveProperty("startIdx");
  expect(pagedCollection).toHaveProperty("pageSize");
  expect(pagedCollection).toHaveProperty("totalItems");
  expect(pagedCollection).toHaveProperty("items");
}
