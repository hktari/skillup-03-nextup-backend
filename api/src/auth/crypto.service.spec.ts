import { Test, TestingModule } from "@nestjs/testing";
import { CryptoService } from "./crypto.service";

describe("CryptoService", () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("hashPassword", () => {
    it("should return a hash string", async () => {
      const hash = await service.hashPassword("secret");
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("validatePassword", () => {
    it("should invalidate wrong password", async () => {
      expect(
        await service.validatePassword(
          "wrong-secret",
          "$2b$10$3bl89uhGn3B03YzKY6hKTuFAWMC55cgY/YuPDTSshhKk8QHPIKWHy"
        )
      ).toBeFalsy();
    });

    it("should validate hashed password", async () => {
      expect(
        await service.validatePassword(
          "secret",
          await service.hashPassword("secret")
        )
      ).toBeTruthy();
    });
  });
});
