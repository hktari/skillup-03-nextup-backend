import { Body, ConsoleLogger, Controller, Inject, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {

    constructor(@Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger) {

    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    login(@Body('email', new ValidationPipe()) email: string, @Body('password', new ValidationPipe()) password: string) {
        this.logger.debug('login: ' + email)
        this.logger.debug('login: ' + password)

    }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        this.logger.debug('signup')
        
    }
}
