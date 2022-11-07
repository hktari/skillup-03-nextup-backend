import dotenv from 'dotenv'

export default class ConfigService {
    constructor(envFile: string = './.env') {
        dotenv.config({path: envFile})
    }

    getOrThrow(key: string) {
        if (process.env[key] === undefined) {
            throw new Error('Failed to find environment variable: ' + key)
        }

        return process.env[key]
    }
}