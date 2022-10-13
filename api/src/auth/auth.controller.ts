import { Body, ClassSerializerInterceptor, ConsoleLogger, Controller, Inject, Post, Req, Res, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express'

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {

    constructor(@Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger,
        private readonly authService: AuthService) {
        this.logger.setContext('AuthController')
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Req() req, @Res() res: Response) {
        const jwt = await this.authService.login(req.user)
        res.status(200).json(jwt)
    }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto)
    }
}
