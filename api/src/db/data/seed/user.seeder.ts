import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Event } from '../../../event/entities/event.entity'
import { Booking } from '../../../booking/entities/booking.entity';
export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get<User>(User)
    await userFactory.saveMany(5);

    const eventFactory = factoryManager.get<Event>(Event)
    const existingUser = await userFactory.save({
      email: 'existing.user@example.com',
      password: '$2b$10$3bl89uhGn3B03YzKY6hKTuFAWMC55cgY/YuPDTSshhKk8QHPIKWHy', //secret
      events: await eventFactory.saveMany(4)
    })

    const existingEvent = await eventFactory.save({
      title: 'existing event',
      user: existingUser
    })

    const bookingRepository = dataSource.getRepository<Booking>(Booking)

    await bookingRepository.save({ event: existingEvent, user: existingUser })
  }
}
