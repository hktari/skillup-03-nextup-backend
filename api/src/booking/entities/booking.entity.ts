import { ManyToOne, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"
import { User } from "../../user/entities/user.entity"
import { Event } from '../../event/entities/event.entity'

@Entity()
export class Booking {

    @ObjectIdColumn()
    id: ObjectID

    @ManyToOne(() => User, user => user.bookings)
    user: User

    @ManyToOne(() => Event, event => event.bookings)
    event: Event
}
