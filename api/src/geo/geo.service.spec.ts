import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';
import { OsmAddress, OsmQuery } from './interface/osm.interface'

import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from '../logger/logger.module';
describe('GeoService', () => {
  let service: GeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule
      ],
      providers: [GeoService],
    }).compile();

    service = module.get<GeoService>(GeoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('autocompleteQuery', () => {
    it('should return an OsmAutocompleteQuery object', async () => {
      const response = await service.autocompleteQuery('mosco')

      expect(response).toEqual(expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({
            properties: expect.objectContaining({
              formatted: expect.any(String)
            })
          })
        ])
      }))
    })
  })
});
