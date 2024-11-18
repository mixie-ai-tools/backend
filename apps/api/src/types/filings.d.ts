export interface FilingUrl {
  ticker: string;
  formType: string;
  accessionNo: string;
  cik: string;
  companyNameLong: string;
  companyName: string;
  linkToFilingDetails?: string; // Optional to match Filing type
  description?: string; // Optional to match Filing type
  linkToTxt?: string; // Optional to match Filing type
  filedAt: string; // ISO date string
  documentFormatFiles?: DocumentFormatFile[]; // Optional
  periodOfReport?: string; // Optional to match Filing type
  entities?: Entity[]; // Optional
  id: string;
  seriesAndClassesContractsInformation?: any[]; // Optional
  linkToHtml?: string; // Optional to match Filing type
  linkToXbrl?: string; // Optional to match Filing type
  dataFiles?: DataFile[]; // Optional
}

export interface DocumentFormatFile {
  sequence: string;
  size: string;
  documentUrl: string;
  description: string;
  type: string;
}

export interface Entity {
  fiscalYearEnd: string;
  stateOfIncorporation: string;
  act: string;
  cik: string;
  fileNo: string;
  irsNo: string;
  companyName: string;
  type: string;
  sic: string;
  filmNo: string;
  undefined?: string; // This field seems to be optional based on provided data
}

export interface DataFile {
  sequence: string;
  size: string;
  documentUrl: string;
  description: string;
  type: string;
}

export interface FilingUrlsResponse {
  filings: FilingUrl[];
  query: {
    from: number;
    size: number;
  };
}

export type Filing = {
  id: number; // Auto-incrementing primary key
  ticker: string; // Stock ticker, max length 10
  formType: string; // Type of form, max length 20
  accessionNo: string; // Accession number, max length 20
  cik: string; // Central Index Key, max length 20
  companyNameLong: string; // Full company name
  companyName: string; // Short company name
  description?: string; // Optional description
  linkToFilingDetails?: string; // Optional link to filing details
  linkToTxt?: string; // Optional link to txt file
  linkToHtml?: string; // Optional link to HTML file
  linkToXbrl?: string; // Optional link to XBRL file
  filedAt: Date; // Filing date
  periodOfReport?: Date; // Optional report period
  documentFormatFiles?: Record<string, any>; // Optional JSONB field for document format files
  entities?: Record<string, any>; // Optional JSONB field for entities
  seriesAndClassesContractsInformation?: Record<string, any>; // Optional JSONB field for series and classes contracts
  dataFiles?: Record<string, any>; // Optional JSONB field for data files
};
