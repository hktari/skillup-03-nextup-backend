import {
  ConsoleLogger,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { PartialType } from "@nestjs/mapped-types";

import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, MongoRepository } from "typeorm";
import { Event } from "./entities/event.entity";
import { PaginatedCollection } from "../common/interface/PaginatedCollection";
import { User } from "../user/entities/user.entity";
import { ILoggerServiceToken } from "../logger/winston-logger.service";
import { Booking } from "../booking/entities/booking.entity";
import { mapToEventEntity } from "../common/mapping";
const ObjectId = require("mongodb").ObjectId;

class PartialEvent extends PartialType(Event) {

}

@Injectable()
export class EventService {
  private readonly eventRepository: MongoRepository<Event>;
  private readonly userRepository: MongoRepository<User>;
  private readonly bookingRepository: MongoRepository<Booking>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger
  ) {
    this.logger.setContext("EventService");

    this.bookingRepository =
      this.dataSource.getMongoRepository<Booking>(Booking);
    this.eventRepository = this.dataSource.getMongoRepository<Event>(Event);
    this.userRepository = this.dataSource.getMongoRepository<User>(User);
  }

  async create(user: User, createEventDto: PartialEvent) {
    const event = this.eventRepository.create(createEventDto);
    if (!user.events) {
      user.events = [];
    }

    // needs to be created manually as _id is generated only when events are added to an event collection
    event.eventId = ObjectId();

    user.events.push(event);
    user = await this.userRepository.save(user);

    return user.events.find((ev) => event.eventId === ev.eventId);
  }

  async count() {
    const { count } = await this.userRepository
      .aggregate([
        {
          $unwind: "$events",
        },
        {
          $count: "count",
        },
      ])
      .next();

    return count;
  }

  async findAll(startIdx: number, pageSize: number) {
    const eventDocumentArr = await this.userRepository
      .aggregate([
        {
          $unwind: "$events",
        },
        {
          $replaceRoot: { newRoot: "$events" },
        },
        {
          $skip: startIdx,
        },
        {
          $limit: pageSize,
        },
      ])
      .toArray();

    // manually map to 'Event' class
    return {
      totalItems: await this.count(),
      items: eventDocumentArr.map((doc) => mapToEventEntity(doc)),
      pageSize,
      startIdx,
    };
  }

  async getFeatured() {
    const totalItems = await this.count();

    if (totalItems === 0) {
      return {};
    }

    const randIdx = Math.floor(Math.random() * totalItems);

    const randomEvent = await this.userRepository
      .aggregate([
        {
          $unwind: "$events",
        },
        {
          $replaceRoot: { newRoot: "$events" },
        },
        {
          $skip: randIdx,
        },
        {
          $limit: 1,
        },
      ])
      .next();

    return mapToEventEntity(randomEvent);
  }

  async findOne(id: string) {
    const eventDocument = await this.userRepository
      .aggregate([
        {
          $unwind: "$events",
        },
        {
          $replaceRoot: { newRoot: "$events" },
        },
        {
          $match: {
            eventId: { $eq: ObjectId(id) },
          },
        },
        {
          $lookup: {
            from: "booking",
            localField: "eventId",
            foreignField: "eventId",
            as: "bookings",
          },
        },
      ])
      .next();

    if (!eventDocument) {
      throw new NotFoundException();
    }

    return mapToEventEntity(eventDocument);
  }
  async update(user: User, id: string, { title, description, datetime, imageUrl, location, max_users }: PartialEvent) {
    const eventIdx = user.events.findIndex(
      (ev) => ev.eventId?.toString() === id
    );
    if (eventIdx === -1) {
      throw new NotFoundException(
        `Failed to find event ${id} inside user ${user.id}`
      );
    }

    const eventToChange = user.events[eventIdx];
    eventToChange.title = title ?? eventToChange.title;
    eventToChange.description =
      description ?? eventToChange.description;
    eventToChange.datetime = datetime ?? eventToChange.datetime;
    eventToChange.imageUrl = imageUrl ?? eventToChange.imageUrl;
    eventToChange.location = location ?? eventToChange.location;
    eventToChange.max_users =
      max_users ?? eventToChange.max_users;

    user = await this.userRepository.save(user);

    return user.events.find((ev) => ev.eventId === eventToChange.eventId);
  }

  async remove(user: User, id: string) {
    this.logger.debug(JSON.stringify(user.events));

    const toDeleteIdx = user.events.findIndex(
      (ev) => ev.eventId?.toString() == id
    );
    this.logger.debug("index of event to be deleted: " + toDeleteIdx);

    if (toDeleteIdx === -1) {
      throw new NotFoundException(
        `Failed to find event: ${id} inside user: ${user.id}`
      );
    }

    user.events.splice(toDeleteIdx, 1);
    await this.userRepository.save(user);
  }

  async findForUser(
    user: User,
    startIdx: number,
    pageSize: number
  ): Promise<PaginatedCollection<Event>> {
    return {
      items: user.events.slice(startIdx, startIdx + pageSize),
      totalItems: user.events.length,
      startIdx,
      pageSize,
    };
  }

  async getUpcomingEventsForUser(
    user: User,
    startIdx: number,
    pageSize: number
  ): Promise<PaginatedCollection<Event>> {
    this.logger.debug("getUpcomingEventsForUser");
    this.logger.debug("user.id " + user.id);

    const bookings = await this.bookingRepository
      .aggregate([
        {
          $match: {
            userId: { $eq: ObjectId(user.id) },
          },
        },
      ])
      .toArray();

    this.logger.debug(`bookings: ` + JSON.stringify(bookings));

    const bookedEventIds = bookings.map((booking) => booking.eventId);

    this.logger.debug(`booked eventIds: ` + JSON.stringify(bookedEventIds));

    const eventDocumentArr = await this.userRepository
      .aggregate([
        {
          $unwind: "$events",
        },
        {
          $match: {
            "events.eventId": { $in: bookedEventIds },
          },
        },
        {
          $replaceRoot: { newRoot: "$events" },
        },
      ])
      .toArray();

    return {
      items: eventDocumentArr.map((doc) => mapToEventEntity(doc)),
      totalItems: eventDocumentArr.length,
      startIdx,
      pageSize,
    };
  }
}
