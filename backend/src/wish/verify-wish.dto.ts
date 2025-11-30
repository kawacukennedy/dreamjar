import { IsEnum, IsOptional, IsString } from "class-validator";

export class VerifyWishDto {
  @IsEnum(["approve", "reject"])
  vote: "approve" | "reject";

  @IsOptional()
  @IsString()
  comment?: string;
}
