import {JoinColumn, ManyToOne, Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"
import { User } from "../../user/entities/user.entity"
import { Event } from '../../event/entities/event.entity'

import { Type } from 'class-transformer'
@Entity()
export class Booking {

    @ObjectIdColumn()
    @Type(() => String)
    id: ObjectID

    @ObjectIdColumn()
    @Type(() => String)
    userId: ObjectID

    @ObjectIdColumn()
    @Type(() => String)
    eventId: ObjectID
}
