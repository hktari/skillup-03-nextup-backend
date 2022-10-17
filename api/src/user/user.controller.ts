import { ClassSerializerInterceptor, ConsoleLogger, Controller, DefaultValuePipe, Get, Inject, NotFoundException, Param, ParseIntPipe, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggedInUser } from '../common/decorators/user.decorator';
import { EventService } from '../event/event.service';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly eventService: EventService,
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger) {
    logger.setContext('UserController')
  }


  @Get('/recent-events')
  @UseGuards(JwtAuthGuard)
  async getRecentEvents(
    @Query('startIdx', new DefaultValuePipe(0)) startIdx: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @LoggedInUser() user: User) {

    return this.eventService.findForUser(user.email, startIdx, pageSize)
  }

  @Get('/upcoming-events')
  @UseGuards(JwtAuthGuard)
  async getUpcomingEvents(
    @Query('startIdx', new DefaultValuePipe(0)) startIdx: number,
    @Query('pageSize', new DefaultValuePipe(10)) pageSize: number,
    @LoggedInUser() user: User) {
    return this.eventService.getUpcomingEventsForUser(user, startIdx, pageSize)
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
