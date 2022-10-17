import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Event } from '../../../event/entities/event.entity'
import { Booking } from '../../../booking/entities/booking.entity';


const ObjectId = require('mongodb').ObjectId;

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get<User>(User)
    const eventFactory = factoryManager.get<Event>(Event)
    const userRepository = dataSource.getRepository(User)


    let existingUser = await userFactory.save({
      email: 'existing.user@example.com',
      password: '$2b$10$3bl89uhGn3B03YzKY6hKTuFAWMC55cgY/YuPDTSshhKk8QHPIKWHy', //secret
      events: []
    })

    for (let i = 0; i < 5; i++) {
      const event = await eventFactory.make({
      })
      existingUser.events.push(event)
    }

    existingUser = await userRepository.save(existingUser)


    let otherUser: User
    // for each user make 5 events. For a total of 15 events
    for (let i = 0; i < 2; i++) {
      const user = await userFactory.save({ events: [] })
      for (let i = 0; i < 5; i++) {
        const event = await eventFactory.make({
        })
        user.events.push(event)
      }
      otherUser = await userRepository.save(user)
    }


    /* -------------------------------------------------------------------------- */
    /*                                  bookings                                  */
    /* -------------------------------------------------------------------------- */




    for (let i = 0; i < existingUser.events.length; i++) {
      const bookingRepository = dataSource.getMongoRepository(Booking)
      await bookingRepository.save({
        eventId: existingUser.events[i].eventId,
        userId: ObjectId(otherUser.id)
      })
    }


    for (let i = 0; i < existingUser.events.length; i++) {
      if (i % 2 === 0) {
        const bookingRepository = dataSource.getMongoRepository(Booking)
        await bookingRepository.save({
          eventId: existingUser.events[i].eventId,
          userId: ObjectId(existingUser.id)
        })
      }
    }
  }
}
