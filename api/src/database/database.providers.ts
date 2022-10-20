import { DatabaseConnection } from "../common/constants";
import { ConfigService } from "@nestjs/config";
import { AppDataSource } from "../data-source";

export const databaseProviders = [
  {
    provide: DatabaseConnection,
    useFactory: (config: ConfigService) => {
      AppDataSource.setOptions({
        url: config.getOrThrow<string>("MONGODB_URL"),
        database: config.getOrThrow<string>("MONGODB_DATABASE"),
      });
      return AppDataSource.initialize();
    },
    inject: [ConfigService],
  },
];
