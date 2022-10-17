import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LoggedInUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@LoggedInUser() user, @Body() createEventDto: CreateEventDto) {
    return this.eventService.create(user, createEventDto);
  }

  @Get()
  findAll(
    @Query('startIdx', new DefaultValuePipe(0), new ParseIntPipe()) startIdx: number,
    @Query('pageSize', new DefaultValuePipe(10), new ParseIntPipe()) pageSize: number,
  ) {
    return this.eventService.findAll(startIdx, pageSize);
  }

  @Get('/featured')
  getFeatured() {
    return this.eventService.getFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@LoggedInUser() user, @Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(user, id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@LoggedInUser() user, @Param('id') id: string) {
    return this.eventService.remove(user, id);
  }
}
