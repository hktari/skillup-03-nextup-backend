import { Module } from '@nestjs/common';
import { EmailService } from './services/EmailService';

@Module({
    providers: [EmailService],
    exports: [EmailService]
})
export class CommonModule {}
