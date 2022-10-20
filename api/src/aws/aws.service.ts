import { BadRequestException, ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import { ConfigService } from '@nestjs/config';
import { ILoggerServiceToken } from '../logger/winston-logger.service';
// Load the SDK for JavaScript
const AWS = require('aws-sdk');
// Set the Region
AWS.config.update({ region: 'eu-central-1' });

interface ImageHeader {
  extension: string;
  encoding: string;
}

@Injectable()
export class AwsService {
  constructor(
    @Inject(ILoggerServiceToken) private logger: ConsoleLogger,
    private configService: ConfigService,
  ) {}

  // header: data:image/jpeg;base64,...
  extractHeader(imageBase64: string): ImageHeader {
    const imageHeader = imageBase64?.substring(0, imageBase64?.indexOf(','));
    try {
      const imageEncoding = imageHeader.split(';')[1];
      const imageExt = imageHeader.split(';')[0].split(':')[1].split('/')[1];
      return {
        extension: imageExt,
        encoding: imageEncoding,
      };
    } catch (error) {
      this.logger.error(
        'failed to extract image header: ' + imageHeader,
        'AwsService',
      );
      throw error;
    }
  }

  extractData(imageBase64: string) {
    const header = this.extractHeader(imageBase64);
    const commaIdx = imageBase64?.indexOf(',');
    if (commaIdx === -1) {
      throw new Error(
        'Invalid image format. Expecting comma to seperate header and data',
      );
    }

    try {
      return imageBase64.substring(commaIdx + 1);
    } catch (error) {
      this.logger.error(
        'failed to extract data from image string: ' + error,
        'AwsService',
      );
      this.logger.debug(imageBase64, 'AwsService');
      throw error;
    }
  }

  uploadImage(objectId: string, imageBase64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const logger = this.logger;

      // Create S3 service object
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

      logger.debug('received imageBase64', 'AwsService');

      const header = this.extractHeader(imageBase64);

      logger.debug(JSON.stringify(header), 'AwsService');

      if (header.encoding !== 'base64') {
        throw new BadRequestException(
          'unsupported image encoding. expecting base64. got: ' +
            header.encoding,
        );
      }

      const imageData = this.extractData(imageBase64);

      const uploadParams = {
        Bucket: this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME'),
        Key: `${objectId}.${header.extension}`,
        Body: null!,
      };

      const buffer = Buffer.from(imageData, 'base64');

      const base64Stream = new PassThrough();
      base64Stream.write(buffer, 'base64');
      base64Stream.end();

      uploadParams.Body = base64Stream;

      logger.debug('uploading image...', 'AwsService');

      // call S3 to retrieve upload file to specified bucket
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          logger.error(err, 'AwsService');
          reject(err);
        }
        if (data) {
          logger.debug('Upload Success: ' + data.Location, 'AwsService');
          resolve(data.Location);
        }
      });
    });
  }
}
