import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CryptoService } from './crypto.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UserService, private readonly cryptoService: CryptoService,
        private readonly jwtService: JwtService) {

    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await this.cryptoService.validatePassword(pass, user.password)) {
            return user
        }
        return null;
    }

    login(user: any) {
        const payload = { email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
        }
    }

    async signup({ email, firstName, lastName, imageBase64, password }: SignupDto) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            throw new BadRequestException(`User with email ${email} already exists`)
        }
        const signup = {
            email,
            firstName,
            lastName,
            password: await this.cryptoService.hashPassword(password),
            imageUrl: 'TODO'
        }
        return await this.usersService.create(signup.firstName, signup.lastName, signup.email, signup.password, signup.imageUrl)
    }
}
