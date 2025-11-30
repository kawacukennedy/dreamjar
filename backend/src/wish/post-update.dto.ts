import { IsString, IsArray, IsOptional, MaxLength } from "class-validator";

export class PostUpdateDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
