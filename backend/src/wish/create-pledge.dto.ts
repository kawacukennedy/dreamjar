import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePledgeDto {
  @IsNumber()
  @Min(100)
  amountMicroTon: number;

  @IsOptional()
  @IsString()
  note?: string;
}
