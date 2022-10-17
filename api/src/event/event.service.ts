import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, MongoRepository } from 'typeorm'
import { Event } from './entities/event.entity'
import { PaginatedCollection } from '../common/interface/PaginatedCollection';
import { User } from '../user/entities/user.entity';
@Injectable()
export class EventService {
  private readonly eventRepository: MongoRepository<Event>;
  private readonly userRepository: MongoRepository<User>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,) {
    this.eventRepository = this.dataSource.getMongoRepository<Event>(Event)
    this.userRepository = this.dataSource.getMongoRepository<User>(User)
  }


  create(user: User, createEventDto: CreateEventDto) {
    throw new NotImplementedException()
    // const event = this.eventRepository.create(createEventDto)
    // event.userId = user.id
    // return this.eventRepository.save(event)
  }

  async findAll() {
    const eventDocumentArr = await this.userRepository.aggregate([
      {
        $unwind: "$events"
      },
      {
        $replaceRoot: { newRoot: "$events" }
      }
    ]).toArray()

    // manually map to 'Event' class
    return eventDocumentArr.map(doc => {
      const event = new Event()
      event.eventId = doc.eventId
      event.title = doc.title
      event.description = doc.description
      event.datetime = doc.datetime
      event.imageUrl = doc.imageUrl
      event.location = doc.location
      event.max_users = doc.max_users
      return event
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }

  async findForUser(email: string, startIdx: number, pageSize: number): Promise<PaginatedCollection<Event>> {
    throw new NotImplementedException()
    // const [items, totalItems] = await this.userRepository.findAndCount({
    //   where: {
    //     "user.email": { $eq: email },
    //   },
    // })

    // return {
    //   items,
    //   totalItems,
    //   startIdx,
    //   pageSize
    // }
  }
}
