import { forwardRef, Module } from "@nestjs/common";
import { CryptoService } from "./crypto.service";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";

import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    CommonModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: { expiresIn: "24h" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CryptoService, AuthService, LocalStrategy, JwtStrategy],
  exports: [CryptoService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
