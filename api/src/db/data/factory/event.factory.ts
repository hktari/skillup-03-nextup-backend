import { setSeederFactory } from 'typeorm-extension';
import { Event } from '../../../event/entities/event.entity';

export default setSeederFactory(Event, (faker) => {
  const event = new Event();
  event.title = `${faker.name.fullName()}: ${faker.music.genre()} ${faker.word.verb()}`;
  event.description = faker.lorem.sentence(5)
  event.imageUrl = faker.image.imageUrl(1920, 1080, 'festival')
  event.max_users = +faker.random.numeric(3);
  event.location = faker.address.streetAddress(true)
  return event;
});
