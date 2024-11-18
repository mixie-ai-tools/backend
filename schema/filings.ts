import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { FilingUrl } from '@/api/src/types/filings';

export const filingsTable = pgTable('filings', {
  id: serial('id').primaryKey(), // Auto-incrementing primary key
  ticker: varchar('ticker', { length: 10 }).notNull(),
  formType: varchar('form_type', { length: 20 }).notNull(),
  accessionNo: varchar('accession_no', { length: 20 }).notNull(),
  cik: varchar('cik', { length: 20 }).notNull(),
  companyNameLong: text('company_name_long').notNull(),
  companyName: text('company_name').notNull(),
  description: text('description'),
  linkToFilingDetails: text('link_to_filing_details'),
  linkToTxt: text('link_to_txt'),
  linkToHtml: text('link_to_html'),
  linkToXbrl: text('link_to_xbrl'),
  filedAt: date('filed_at').notNull(),
  periodOfReport: date('period_of_report'),
  documentFormatFiles: jsonb('document_format_files'),
  entities: jsonb('entities'),
  seriesAndClassesContractsInformation: jsonb(
    'series_and_classes_contracts_information',
  ),
  dataFiles: jsonb('data_files'),

  // Additional metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
} as const);

// Manually define the InsertableFiling type
export type InsertableFiling = {
  // Required fields
  ticker: string;
  formType: string;
  accessionNo: string;
  cik: string;
  companyNameLong: string;
  companyName: string;
  filedAt: string;

  // Optional fields
  description?: string;
  linkToFilingDetails?: string;
  linkToTxt?: string;
  linkToHtml?: string;
  linkToXbrl?: string;
  periodOfReport?: string;
  documentFormatFiles?: any;
  entities?: any;
  seriesAndClassesContractsInformation?: any;
  dataFiles?: any;
};

export function convertFilingUrlToInsertable(
  filing: FilingUrl,
): InsertableFiling {
  return {
    // Required fields
    ticker: filing.ticker,
    formType: filing.formType,
    accessionNo: filing.accessionNo,
    cik: filing.cik,
    companyNameLong: filing.companyNameLong,
    companyName: filing.companyName,
    filedAt: new Date(filing.filedAt).toISOString(),

    // Optional fields
    description: filing.description,
    linkToFilingDetails: filing.linkToFilingDetails,
    linkToTxt: filing.linkToTxt,
    linkToHtml: filing.linkToHtml,
    linkToXbrl: filing.linkToXbrl,
    periodOfReport: filing.periodOfReport
      ? new Date(filing.periodOfReport).toISOString()
      : undefined,
    documentFormatFiles: filing.documentFormatFiles,
    entities: filing.entities,
    seriesAndClassesContractsInformation:
      filing.seriesAndClassesContractsInformation,
    dataFiles: filing.dataFiles,
  };
}
