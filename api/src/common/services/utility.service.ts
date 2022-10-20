import { Injectable } from "@nestjs/common";

const { v4: uuidv4 } = require('uuid');

@Injectable()
export class UtilityService {
    generateUuid() {
        return uuidv4();
    }
}