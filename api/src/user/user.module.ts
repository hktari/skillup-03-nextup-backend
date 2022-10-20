import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseModule } from "../database/database.module";
import { UserProviders } from "./user.providers";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { ProfileController } from "./profile.controller";
import { EventModule } from "../event/event.module";
import { AwsModule } from "../aws/aws.module";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [AwsModule, CommonModule, DatabaseModule, forwardRef(() => AuthModule), EventModule],
  controllers: [UserController, ProfileController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
