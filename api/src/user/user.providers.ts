import { Provider } from "@nestjs/common";
import { DatabaseConnection, UserRepository } from "../common/constants";
import { DataSource } from 'typeorm'
import { User } from "./entities/user.entity";

export const UserProviders: Provider<any>[] = [
    {
        provide: UserRepository,
        useFactory: (dataSource: DataSource) => {
            return dataSource.getRepository<User>(User)
        },
        inject: [DatabaseConnection]
    }
]