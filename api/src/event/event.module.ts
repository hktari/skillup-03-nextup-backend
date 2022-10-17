import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [forwardRef(() => BookingModule)],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule { }
