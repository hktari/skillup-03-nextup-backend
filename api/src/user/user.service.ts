import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../common/constants";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CryptoService } from "../auth/crypto.service";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { mapToUserEntity } from "../common/mapping";
const ObjectId = require("mongodb").ObjectId;

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>;

  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    private readonly cryptoService: CryptoService
  ) {
    this.userRepository = dataSource.getRepository<User>(User);
  }

  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageUrl: string
  ) {
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: await this.cryptoService.hashPassword(password),
      imageUrl,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const userDoc = await this.userRepository.findOne({
      where: { email },
    });

    if (!userDoc) {
      return null;
    }

    return mapToUserEntity(userDoc);
  }

  async update(
    email: string,
    firstName?: string,
    lastName?: string,
    password?: string,
    imageUrl?: string
  ) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.imageUrl = imageUrl ?? user.imageUrl;

    if (password) {
      user.password = await this.cryptoService.hashPassword(password);
    }

    return await this.userRepository.save(user);
  }
}
