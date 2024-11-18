import { IsString } from '@nestjs/class-validator';

export class SecFilingPullDto {
  @IsString()
  ticker: string;

  @IsString()
  formType: string;

  @IsString()
  year: string;

  @IsString()
  month: string;

  @IsString()
  sectionName: string;
}
