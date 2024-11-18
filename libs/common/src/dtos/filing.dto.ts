import { IsString, IsOptional, IsNumber } from 'class-validator';

export class InsertableFilingDto {
  @IsNumber()
  id: number;

  @IsString()
  sectionName: string;

  // Required fields
  @IsString()
  ticker: string;

  @IsString()
  formType: string;

  @IsString()
  accessionNo: string;

  @IsString()
  cik: string;

  @IsString()
  companyNameLong: string;

  @IsString()
  companyName: string;

  @IsString()
  filedAt: string;

  // Optional fields
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  linkToFilingDetails?: string;

  @IsOptional()
  @IsString()
  linkToTxt?: string;

  @IsOptional()
  @IsString()
  linkToHtml?: string;

  @IsOptional()
  @IsString()
  linkToXbrl?: string;

  @IsOptional()
  @IsString()
  periodOfReport?: string;

  @IsOptional()
  documentFormatFiles?: any;

  @IsOptional()
  entities?: any;

  @IsOptional()
  seriesAndClassesContractsInformation?: any;

  @IsOptional()
  dataFiles?: any;
}
