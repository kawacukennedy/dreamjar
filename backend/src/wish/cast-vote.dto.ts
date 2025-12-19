import { IsEnum, IsOptional, IsString } from "class-validator";

export class CastVoteDto {
  @IsEnum(["yes", "no"])
  choice: "yes" | "no";

  @IsOptional()
  @IsString()
  comment?: string;
}
