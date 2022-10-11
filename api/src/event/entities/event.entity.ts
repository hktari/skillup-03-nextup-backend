import { ManyToOne, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"
import { Booking } from "../../booking/entities/booking.entity"
import { User } from "../../user/entities/user.entity"

@Entity()
export class Event {

    @ObjectIdColumn()
    id: ObjectID

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    location: string

    @Column()
    max_users: number

    @Column()
    imageUrl: string

    @ManyToOne(() => User, user => user.events)
    user: User

    @ManyToOne(() => Booking, booking => booking.event)
    bookings: Booking[]
}
