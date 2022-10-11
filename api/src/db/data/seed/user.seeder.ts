import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Event } from '../../../event/entities/event.entity'
export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    console.log('users ....');

    const userFactory = factoryManager.get<User>(User)
    await userFactory.saveMany(5);

    const eventFactory = factoryManager.get<Event>(Event)
    await userFactory.save({
      events: await eventFactory.saveMany(5)
    })
  }
}
