import {
  BadRequestException,
  ConsoleLogger,
  Inject,
  Injectable,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { CryptoService } from "./crypto.service";
import { JwtService } from "@nestjs/jwt";
import { SignupDto } from "./dto/signup.dto";
import { ILoggerServiceToken } from "../logger/winston-logger.service";
import { EmailService } from "../common/services/email.service";
import { ConfigService } from "@nestjs/config";
class PasswordResetJWT {
  email: string;
  expiresAt: Date;
  lastPasswordChangedDate: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger,
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    this.logger.debug("user password: " + user.password);
    if (
      user &&
      (await this.cryptoService.validatePassword(pass, user.password))
    ) {
      return user;
    }
    return null;
  }

  login(user: any) {
    const payload = { email: user.email };
    const expiresDurationMs = 24 * 60 * 60 * 1000;
    return {
      access_token: this.jwtService.sign(payload),
      expiresAt: new Date(Date.now() + expiresDurationMs)
    };
  }

  async signup({
    email,
    firstName,
    lastName,
    imageUrl,
    password,
  }) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }
    const signup = {
      email,
      firstName,
      lastName,
      password,
      imageUrl,
    };
    return await this.usersService.create(
      signup.firstName,
      signup.lastName,
      signup.email,
      signup.password,
      signup.imageUrl
    );
  }

  async initiatePasswordReset(email: string) {
    const expiresDurationMs = 1000 * 60 * 10;

    const pwdResetPayload = {
      email,
    };
    const pwdResetToken = await this.jwtService.signAsync(pwdResetPayload, {
      secret: this.configService.getOrThrow("JWT_SECRET"),
      expiresIn: "10min",
    });
    return await this.emailService.sendPasswordReset(email, pwdResetToken);
  }

  async validatePasswordReset(token: string) {
    try {
      return await this.jwtService.verifyAsync<PasswordResetJWT>(token, {
        secret: this.configService.getOrThrow("JWT_SECRET"),
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
