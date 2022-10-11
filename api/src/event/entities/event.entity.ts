import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm"

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
}
