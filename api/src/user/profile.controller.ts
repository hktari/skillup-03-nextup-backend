
import { BadRequestException, Body, ConsoleLogger, Controller, DefaultValuePipe, Get, Inject, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggedInUser } from '../common/decorators/user.decorator';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        @Inject(ILoggerServiceToken) private readonly logger: ConsoleLogger) {
        logger.setContext('ProfileController')
    }
    // - PUT /profile
    @Put()
    update(@LoggedInUser() user: User, @Body() updateUserDto: UpdateUserDto) {
        let imageUrl
        if (updateUserDto.imageBase64) {
            imageUrl = 'TODO'
        }

        return this.userService.update(user.email, updateUserDto.firstName, updateUserDto.lastName, imageUrl)
    }

    @Post('change-password')
    async updatePassword(
        @LoggedInUser() user: User,
        @Body('oldPassword') oldPassword: string,
        @Body('newPassword') newPassword: string) {
        this.logger.debug(`updating password from ${oldPassword} to ${newPassword}`)

        if (!await this.authService.validateUser(user.email, oldPassword)) {
            throw new BadRequestException('Invalid value for oldPassword')
        }

        return this.userService.update(user.email, undefined, undefined, newPassword, undefined)
    }


    // - POST /profile/change-password
    // - GET /profile


}
