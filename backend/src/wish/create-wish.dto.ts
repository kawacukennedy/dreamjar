import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from "class-validator";

export class CreateWishDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsNumber()
  @Min(1000)
  stakeAmountMicroTon: number;

  @IsDateString()
  goalDeadline: string;

  @IsEnum(["media", "gps", "github", "strava", "custom"])
  proofMethod: "media" | "gps" | "github" | "strava" | "custom";

  @IsOptional()
  @IsEnum(["public", "private", "friends"])
  visibility?: "public" | "private" | "friends";

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  impactAllocationOnFail?: number;
}
