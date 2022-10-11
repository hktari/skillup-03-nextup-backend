import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../common/constants';
import { Repository } from 'typeorm'
import { User } from './entities/user.entity';
import { CryptoService } from '../auth/crypto.service';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository) private readonly userRepository: Repository<User>,
        private readonly cryptoService: CryptoService) {

    }

    async create(firstName: string, lastName: string, email: string, password: string, imageUrl: string) {
        const user = this.userRepository.create({
            firstName,
            lastName,
            email,
            password: await this.cryptoService.hashPassword(password),
            imageUrl
        })


        return await this.userRepository.save(user)
    }

    

}
