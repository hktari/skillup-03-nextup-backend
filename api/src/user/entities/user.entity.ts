import { OneToMany, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";
import { Booking } from "../../booking/entities/booking.entity";
import { Event } from "../../event/entities/event.entity";
import { Exclude } from "class-transformer";

import { Type } from "class-transformer";
@Entity()
export class User {
  @ObjectIdColumn()
  @Type(() => String)
  id: ObjectID;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  imageUrl: string;

  @Column()
  @Type(() => Event)
  events: Event[];
}
