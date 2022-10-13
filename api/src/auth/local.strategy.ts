
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, ConsoleLogger, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ILoggerServiceToken } from '../logger/winston-logger.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService, @Inject(ILoggerServiceToken) private logger: ConsoleLogger) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });

        this.logger.setContext('LocalStrategy')
    }

    async validate(email: string, password: string): Promise<any> {
        this.logger.debug(`Validate user: ${email}:${password}`)

        const user = await this.authService.validateUser(email, password);

        if (!user) {
            this.logger.debug('invalid credentials')
            throw new BadRequestException('Invalid credentials');
        }
        
        return user;
    }
}
