import { OneToMany, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"
import { Booking } from "../../booking/entities/booking.entity"
import { Event } from '../../event/entities/event.entity'
@Entity()
export class User {

    @ObjectIdColumn()
    id: ObjectID

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column()
    imageUrl: string

    @OneToMany(() => Booking, booking => booking.user, {
        cascade: true
    })
    bookings: Booking[]

    @OneToMany(() => Event, event => event.user, {
        cascade: true
    })
    events: Event[]
}
