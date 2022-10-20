import { Booking } from "../booking/entities/booking.entity";
import { User } from "../user/entities/user.entity";
import { Event } from "../event/entities/event.entity";

export function mapToBookingEntity(doc: any) {
  const booking = new Booking();
  booking.eventId = doc.eventId;
  booking.userId = doc.userId;
  booking.id = doc.id;
  return booking;
}

export function mapToEventEntity(doc: any) {
  const event = new Event();
  event.eventId = doc.eventId;
  event.title = doc.title;
  event.description = doc.description;
  event.datetime = doc.datetime;
  event.imageUrl = doc.imageUrl;
  event.location = doc.location;
  event.max_users = doc.max_users;
  if (doc.bookings) {
    event.bookings = doc.bookings.map((bookingDoc) =>
      mapToBookingEntity(bookingDoc)
    );
  }
  return event;
}

export function mapToUserEntity(userDoc: any) {
  const user: User = new User();
  user.email = userDoc.email;
  user.firstName = userDoc.firstName;
  user.lastName = userDoc.lastName;
  user.id = userDoc.id;
  user.imageUrl = userDoc.imageUrl;
  user.password = userDoc.password;
  if (userDoc.events) {
    user.events = userDoc.events.map((eventDoc) => mapToEventEntity(eventDoc));
  }
  return user;
}
