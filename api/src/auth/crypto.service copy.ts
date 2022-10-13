import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  hashPassword(password: string) {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }

  validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
