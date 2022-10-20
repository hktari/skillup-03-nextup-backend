import { forwardRef, Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { BookingModule } from "../booking/booking.module";
import { CommonModule } from "../common/common.module";
import { AwsModule } from "../aws/aws.module";

@Module({
  imports: [forwardRef(() => BookingModule), CommonModule, AwsModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule { }
