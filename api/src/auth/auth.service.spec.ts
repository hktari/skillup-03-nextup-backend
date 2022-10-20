import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";
import { CryptoService } from "./crypto.service";
import { JwtService } from "@nestjs/jwt";

describe("AuthService", () => {
  let service: AuthService;
  let userService: UserService;
  const existingUser = {
    email: "existing.user@example.com",
    password: "$2b$10$3bl89uhGn3B03YzKY6hKTuFAWMC55cgY/YuPDTSshhKk8QHPIKWHy", // secret
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, CryptoService, UserService, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(UserService)
      .useFactory({
        factory: () => {
          return {
            findByEmail: jest.fn((email) => {
              console.log("called !");
              if (email === "existing.user@example.com") {
                return Promise.resolve(existingUser);
              } else {
                return Promise.resolve(null);
              }
            }),
          };
        },
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return null if user not found", async () => {
      expect(
        await service.validateUser("nonexisting.user@example.com", "secret")
      ).toBe(null);
    });
    it("should return user object when valid email and password", async () => {
      expect(
        await service.validateUser("existing.user@example.com", "secret")
      ).toBe(existingUser);
    });

    it("should return null when invalid password", async () => {
      expect(
        await service.validateUser("existing.user@example.com", "wrong-secret")
      ).toBe(null);
    });
  });
});
