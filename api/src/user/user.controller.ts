import { ConsoleLogger, Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger) {
    logger.setContext('UserController')
  }


  @Get(':email')
  async getOne(@Param('email') email: string) {
    this.logger.debug('searching for user by email: ' + email)
    const user = await this.userService.findByEmail(email)
    if (!user) {
      this.logger.debug('user not found')
      throw new NotFoundException(`Failed to find user with email: ${email}`)
    }

    return user
  }
}
