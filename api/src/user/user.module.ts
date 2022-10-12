import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseModule } from '../database/database.module';
import { UserProviders } from './user.providers';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity';
import { ProfileController } from './profile.controller';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserController, ProfileController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
