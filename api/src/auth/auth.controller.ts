import { Body, ConsoleLogger, Controller, Inject, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {

    constructor(@Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger,
        private readonly authService: AuthService) {

    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    login(@Req() req) {
        return this.authService.login(req.user)

    }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        this.logger.debug('signup')
        return this.authService.signup(signupDto)
    }
}
