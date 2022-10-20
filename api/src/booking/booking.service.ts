import {
  ConsoleLogger,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ILoggerServiceToken } from "../logger/winston-logger.service";
import { User } from "../user/entities/user.entity";
import { Booking } from "./entities/booking.entity";
import { Event } from "../event/entities/event.entity";
import { DataSource, MongoRepository } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { EventService } from "../event/event.service";
import { UserService } from "../user/user.service";
import { mapToBookingEntity } from "../common/mapping";
@Injectable()
export class BookingService {
  private readonly bookingRepository: MongoRepository<Booking>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger
  ) {
    this.logger.setContext("EventService");

    this.bookingRepository =
      this.dataSource.getMongoRepository<Booking>(Booking);
  }

  create(user: User, event: Event) {
    const booking = this.bookingRepository.create({
      userId: user.id,
      eventId: event.eventId,
    });

    return this.bookingRepository.save(booking);
  }

  async findOne(user: User, event: Event) {
    const bookingDoc = await this.bookingRepository.findOne({
      where: {
        userId: user.id,
        eventId: event.eventId,
      },
    });

    return mapToBookingEntity(bookingDoc);
  }

  async delete(user: User, event: Event) {
    const booking = await this.findOne(user, event);
    if (!booking) {
      throw new NotFoundException(`Failed to find booking for user`);
    }

    await this.bookingRepository.deleteOne(booking);
  }
}
