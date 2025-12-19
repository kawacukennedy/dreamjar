import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class WishListDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(["active", "pending_verification", "verified", "failed", "cancelled"])
  status?:
    | "active"
    | "pending_verification"
    | "verified"
    | "failed"
    | "cancelled";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  categories?: string[];

  @IsOptional()
  @IsString()
  creator?: string; // user ID

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStake?: number; // in microTON

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxStake?: number; // in microTON

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPledged?: number; // in microTON

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPledged?: number; // in microTON

  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @IsOptional()
  @IsDateString()
  deadlineTo?: string;

  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @IsOptional()
  @IsEnum([
    "newest",
    "oldest",
    "trending",
    "most-pledged",
    "ending-soon",
    "least-pledged",
  ])
  sortBy?:
    | "newest"
    | "oldest"
    | "trending"
    | "most-pledged"
    | "ending-soon"
    | "least-pledged";

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsEnum(["public", "private", "friends"])
  visibility?: "public" | "private" | "friends";

  @IsOptional()
  @IsString()
  proofMethod?: string;

  @IsOptional()
  @Type(() => Boolean)
  sponsored?: boolean;
}
