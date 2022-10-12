import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UserService, private readonly cryptoService: CryptoService,
        private readonly jwtService: JwtService) {

    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && this.cryptoService.validatePassword(pass, user.password)) {
            return user
        }
        return null;
    }

    login(user: any) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }
}
