import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConsoleLogger,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LoggedInUser } from "../common/decorators/user.decorator";
import { ILoggerServiceToken } from "../logger/winston-logger.service";
import { UpdateUserDto } from "./dto/UpdateUserDto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { Response } from "express";
import { AwsService } from "../aws/aws.service";
import { UtilityService } from "../common/services/utility.service";

@Controller("profile")
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
    private readonly utility: UtilityService,
    @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger
  ) {
    logger.setContext("ProfileController");
  }

  @Put()
  async update(@LoggedInUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    let imageUrl;
    if (updateUserDto.imageBase64) {
      imageUrl = await this.awsService.uploadImage(this.utility.generateUuid(), updateUserDto.imageBase64);
    }

    return await this.userService.update(
      user.email,
      updateUserDto.firstName,
      updateUserDto.lastName,
      undefined,
      imageUrl
    );
  }

  @Post("change-password")
  async updatePassword(
    @Res() res: Response,
    @LoggedInUser() user: User,
    @Body("oldPassword") oldPassword: string,
    @Body("newPassword") newPassword: string
  ) {
    this.logger.debug(
      `updating password from ${oldPassword} to ${newPassword}`
    );

    if (!(await this.authService.validateUser(user.email, oldPassword))) {
      throw new BadRequestException("Invalid value for oldPassword");
    }

    await this.userService.update(
      user.email,
      undefined,
      undefined,
      newPassword,
      undefined
    );

    this.logger.debug("successfuly changed password");
    res.sendStatus(200);
  }

  @Get()
  get(@LoggedInUser() user: User) {
    this.logger.debug("user object type:" + typeof user);
    return user;
  }
}
