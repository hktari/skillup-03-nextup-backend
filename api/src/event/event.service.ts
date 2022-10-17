import { ConsoleLogger, Inject, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, MongoRepository } from 'typeorm'
import { Event } from './entities/event.entity'
import { PaginatedCollection } from '../common/interface/PaginatedCollection';
import { User } from '../user/entities/user.entity';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { Booking } from '../booking/entities/booking.entity';
const ObjectId = require('mongodb').ObjectId;

@Injectable()
export class EventService {
  private readonly eventRepository: MongoRepository<Event>;
  private readonly userRepository: MongoRepository<User>;
  private readonly bookingRepository: MongoRepository<Booking>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger) {
    this.logger.setContext('EventService')

    this.bookingRepository = this.dataSource.getMongoRepository<Booking>(Booking)
    this.eventRepository = this.dataSource.getMongoRepository<Event>(Event)
    this.userRepository = this.dataSource.getMongoRepository<User>(User)
  }

  private mapToBookingEntity(doc: any) {
    let booking = new Booking()
    booking.eventId = doc.eventId
    booking.userId = doc.userId
    booking.id = doc.id
    return booking
  }

  private mapToEventEntity(doc: any) {
    const event = new Event()
    event.eventId = doc.eventId
    event.title = doc.title
    event.description = doc.description
    event.datetime = doc.datetime
    event.imageUrl = doc.imageUrl
    event.location = doc.location
    event.max_users = doc.max_users
    if (doc.bookings) {
      event.bookings = doc.bookings.map(bookingDoc => this.mapToBookingEntity(bookingDoc))
    }
    return event
  }


  create(user: User, createEventDto: CreateEventDto) {
    const event = this.eventRepository.create(createEventDto)
    if (!user.events) {
      user.events = []
    }

    user.events.push(event)
    return this.userRepository.save(user)
  }

  async count() {
    const { count } = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $count: "count"
      }
    ]).next()

    return count
  }

  async findAll(startIdx: number, pageSize: number) {
    const eventDocumentArr = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $replaceRoot: { newRoot: "$events" }
      },
      {
        $skip: startIdx
      },
      {
        $limit: pageSize
      }
    ]).toArray()



    // manually map to 'Event' class
    return {
      totalItems: await this.count(),
      items: eventDocumentArr.map(doc => this.mapToEventEntity(doc)),
      pageSize,
      startIdx
    }
  }

  async getFeatured() {
    const totalItems = await this.count()

    if (totalItems === 0) {
      return {}
    }

    const randIdx = Math.floor(Math.random() * totalItems)

    const randomEvent = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $replaceRoot: { newRoot: "$events" }
      },
      {
        $skip: randIdx
      },
      {
        $limit: 1
      }
    ]).next()

    return this.mapToEventEntity(randomEvent)
  }

  async findOne(id: string) {
    const eventDocument = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $replaceRoot: { newRoot: "$events" }
      },
      {
        $match: {
          "eventId": { $eq: ObjectId(id) }
        }
      },
      {
        $lookup:
        {
          from: "booking",
          localField: "eventId",
          foreignField: "eventId",
          as: "bookings"
        }
      }
    ]).next()

    if (!eventDocument) {
      throw new NotFoundException()
    }

    return this.mapToEventEntity(eventDocument)
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }

  async findForUser(user: User, startIdx: number, pageSize: number): Promise<PaginatedCollection<Event>> {
    return {
      items: user.events.slice(startIdx, startIdx + pageSize),
      totalItems: user.events.length,
      startIdx,
      pageSize
    }
  }

  async getUpcomingEventsForUser(user: User, startIdx: number, pageSize: number): Promise<PaginatedCollection<Event>> {
    this.logger.debug('getUpcomingEventsForUser')
    this.logger.debug('user.id ' + user.id)

    const bookings = await this.bookingRepository.aggregate(
      [
        {
          $match: {
            "userId": { $eq: ObjectId(user.id) }
          }
        }
      ]).toArray()

    this.logger.debug(`bookings: ` + JSON.stringify(bookings))

    const bookedEventIds = bookings.map(booking => booking.eventId)

    this.logger.debug(`booked eventIds: ` + JSON.stringify(bookedEventIds))

    const eventDocumentArr = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $match: {
          "events.eventId": { $in: bookedEventIds }
        }
      },
      {
        $replaceRoot: { newRoot: "$events" }
      }
    ]).toArray()

    return {
      items: eventDocumentArr.map(doc => this.mapToEventEntity(doc)),
      totalItems: eventDocumentArr.length,
      startIdx,
      pageSize
    }
  }
}
