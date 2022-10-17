import * as request from 'supertest';
import { User } from '../src/user/entities/user.entity';

export function getAuthToken(app, { email, password }: { email: string, password: string }) {
  const validCredentials = {
    email,
    password,
  };
  return request(app.getHttpServer())
    .post('/auth/login')
    .send(validCredentials)
    .then((res) => res.body.access_token);
}

/* ------------------------------- // utility ------------------------------- */
export function expectUserEntity(user: any, expectRelations = true) {
  expect(user).toHaveProperty('firstName');
  expect(user).toHaveProperty('lastName');
  expect(user).toHaveProperty('email');
  expect(user).not.toHaveProperty('password');
  expect(user).toHaveProperty('imageUrl');
  if (expectRelations) {
    expect(user).toHaveProperty('events');
  }
}

export function expectEventEntity(event: any, expectRelations = true) {
  expect(event).toHaveProperty('title')
  expect(event).toHaveProperty('description')
  expect(event).toHaveProperty('location')
  expect(event).toHaveProperty('max_users')
  expect(event).toHaveProperty('imageUrl')
  if (expectRelations) {
    expect(event).toHaveProperty('bookings')
  }
}

export function expectPagedCollection(pagedCollection: any) {
  expect(pagedCollection).toHaveProperty('startIdx');
  expect(pagedCollection).toHaveProperty('pageSize');
  expect(pagedCollection).toHaveProperty('totalItems');
  expect(pagedCollection).toHaveProperty('items');
}
