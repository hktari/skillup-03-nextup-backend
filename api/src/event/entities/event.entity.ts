import { Generated, PrimaryColumn, JoinColumn, ManyToOne, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"
import { Booking } from "../../booking/entities/booking.entity"
import { User } from "../../user/entities/user.entity"
import { Exclude, Type } from 'class-transformer'

@Entity()
export class Event {

    @ObjectIdColumn()
    @Type(() => String)
    eventId: ObjectID

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

    @Column()
    datetime: Date

    @Type(() => Booking)
    bookings: Booking[]
}
