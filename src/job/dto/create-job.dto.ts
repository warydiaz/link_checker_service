import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional, IsUrl } from 'class-validator';
import { IsNotPrivateUrl } from '../validators/is-not-private-url.validator';
export class CreateJobDto {
  @IsUrl()
  @IsNotPrivateUrl()
  url: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  concurrency?: number = 2;
}
