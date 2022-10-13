
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import { UserService } from '../user/user.service';
import { ILoggerServiceToken } from '../logger/winston-logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService, private userService: UserService, @Inject(ILoggerServiceToken) private logger: ConsoleLogger) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });

        this.logger.setContext('JwtStrategy')
    }

    async validate(payload: any) {
        this.logger.debug('Validating payload: ' + JSON.stringify(payload))
        return await this.userService.findByEmail(payload.email)
    }
}
