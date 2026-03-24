import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsUrl } from 'class-validator';
export class CreateJobDto {
  @IsUrl()
  url: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  concurrency?: number = 2;
}
