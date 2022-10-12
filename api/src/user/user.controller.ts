import { ConsoleLogger, Controller, DefaultValuePipe, Get, Inject, NotFoundException, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggedInUser } from '../common/decorators/user.decorator';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger) {
    logger.setContext('UserController')
  }


  @Get('/recent-events')
  @UseGuards(JwtAuthGuard)
  async getRecentEvents(
    @Query('startIdx', new DefaultValuePipe(0)) startIdx: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @LoggedInUser() user: User) {

  }

  @Get('/upcoming-events')
  @UseGuards(JwtAuthGuard)
  async getUpcomingEvents(
    @Query('startIdx', new DefaultValuePipe(0)) startIdx: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @LoggedInUser() user: User) {
      this.logger.debug(JSON.stringify(user))

      return user.bookings      
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
