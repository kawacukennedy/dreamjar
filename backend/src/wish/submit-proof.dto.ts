import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SubmitProofDto {
  @IsEnum(["media", "gps", "github", "strava", "custom"])
  proofMethod: "media" | "gps" | "github" | "strava" | "custom";

  @IsOptional()
  @IsString()
  mediaURI?: string;

  @IsOptional()
  @IsString()
  mediaHash?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  customProof?: any;
}
