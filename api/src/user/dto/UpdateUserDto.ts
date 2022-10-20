import { OmitType, PartialType } from "@nestjs/swagger";
import { SignupDto } from "../../auth/dto/signup.dto";

export class UpdateUserDto extends PartialType(
  OmitType(SignupDto, ["email", "password"] as const)
) {}
