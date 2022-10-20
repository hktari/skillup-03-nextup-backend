import { Module } from "@nestjs/common";
import { EmailService } from "./services/email.service";
import { UtilityService } from "./services/utility.service";

@Module({
  providers: [EmailService, UtilityService],
  exports: [EmailService, UtilityService],
})
export class CommonModule {}
