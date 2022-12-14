import {
  Body,
  ClassSerializerInterceptor,
  ConsoleLogger,
  Controller,
  Inject,
  Param,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { ILoggerServiceToken } from "../logger/winston-logger.service";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { response, Response } from "express";
import { UserService } from "../user/user.service";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { AwsService } from "../aws/aws.service";
import { UtilityService } from "../common/services/utility.service";
@UseInterceptors(ClassSerializerInterceptor)
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly utility: UtilityService
  ) {
    this.logger.setContext("AuthController");
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  async login(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.login(req.user);
    res.status(200).json(jwt);
  }

  @Post("signup")
  async signup(@Body() signupDto: SignupDto) {

    let imageUrl = null
    if (signupDto.imageBase64) {
      imageUrl = await this.awsService.uploadImage(this.utility.generateUuid(), signupDto.imageBase64)
    }
    return await this.authService.signup({
      ...signupDto,
      imageUrl
    });
  }

  @Post("password-reset")
  async passwordReset(
    @Res() res: Response,
    @Body() { email }: RequestPasswordResetDto
  ) {
    this.logger.debug("requesting password reset for email: " + email);

    const user = await this.userService.findByEmail(email);
    if (!user) {
      // return success code if email is not found
      res.sendStatus(200);
    } else {
      await this.authService.initiatePasswordReset(email);
      res.sendStatus(200);
    }
  }

  @Get("password-reset/:token")
  async validatePasswordResetToken(
    @Res() res: Response,
    @Param("token") token: string
  ) {
    this.logger.debug("validating pwd reset token: " + token);

    await this.authService.validatePasswordReset(token);

    res.sendStatus(200);
  }

  @Post("password-reset/:token")
  async changePasswordWithToken(
    @Res() res: Response,
    @Param("token") token: string,
    @Body("password") password: string
  ) {
    this.logger.debug("changing password to: " + password);

    const jwt = await this.authService.validatePasswordReset(token);

    await this.userService.update(
      jwt.email,
      undefined,
      undefined,
      password,
      undefined
    );

    res.sendStatus(200);
  }
}
