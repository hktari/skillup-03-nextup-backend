import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { AwsService } from './aws.service';

@Module({
  imports: [LoggerModule],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
