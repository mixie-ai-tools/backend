// sec.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { queryApi } from 'sec-api';
import type { FilingUrlsResponse } from '@/api/src/types/filings';
import { convertFilingUrlToInsertable } from '@/schema';
import { filingsTable } from '@/schema';
import { SecFilingPullDto, InsertableFilingDto } from '@app/common/dtos';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { eq, and, gte, lte } from 'drizzle-orm/expressions';

const convertToFilingDto = (data: any): InsertableFilingDto => {
  return plainToInstance(InsertableFilingDto, data);
};

@Injectable()
export class SecService {
  constructor(
    @Inject('POSTGRES_SERVICE') private readonly db: PostgresJsDatabase,
    @Inject('RABBIT_MQ_SERVICE') private readonly client: ClientProxy,
  ) {
    queryApi.setApiKey(process.env.SEC_API_KEY);
    this.client.connect();
  }

  // New method to fetch filing from SEC API and save it
  private async fetchAndSaveFilingFromApi(
    data: SecFilingPullDto,
  ): Promise<InsertableFilingDto> {
    const year = data.year;
    const month = String(data.month).padStart(2, '0');
    const firstOfMonth = `${year}-${month}-01`;
    const lastOfMonth = `${year}-${month}-31`;

    const universeQuery = `
      ticker:(${data.ticker}) 
      AND formType:"${data.formType}" 
      AND filedAt:[${firstOfMonth} TO ${lastOfMonth}]`;

    const query = {
      query: universeQuery,
      from: '0',
      size: '1', // Only fetch one record
      sort: [{ filedAt: { order: 'desc' } }],
    };

    const response = (await queryApi.getFilings(query)) as FilingUrlsResponse;
    const filings = response.filings;

    if (!filings || filings.length === 0) {
      throw new Error('No filing found from SEC API');
    }

    // Get the first (and only) filing from the response
    const filing = filings[0];
    const insertableFiling = convertFilingUrlToInsertable(filing);

    // Insert data into the database
    const result = await this.db
      .insert(filingsTable)
      .values([insertableFiling])
      .returning()
      .execute()
      .then((response) => response[0]);

    // Create and return the DTO
    const dto = convertToFilingDto(filing);
    dto.id = result.id;
    dto.sectionName = data.sectionName;

    return dto;
  }
  async getAndSaveFiling(data: SecFilingPullDto): Promise<void> {
    const year = parseInt(data.year, 10);
    const month = String(data.month).padStart(2, '0');

    // Get the first and last days of the specified month
    const firstOfMonth = `${year}-${month}-01`;
    const lastOfMonth = new Date(year, parseInt(data.month, 10), 0)
      .toISOString()
      .split('T')[0]; // Correct last day of the month

    // Check if filing already exists in the database
    const existingFiling = await this.db
      .select()
      .from(filingsTable)
      .where(
        and(
          eq(filingsTable.ticker, data.ticker),
          eq(filingsTable.formType, data.formType),
          gte(filingsTable.filedAt, firstOfMonth),
          lte(filingsTable.filedAt, lastOfMonth),
        ),
      )
      .execute();

    let dto: InsertableFilingDto;

    if (existingFiling.length > 0) {
      Logger.log('Filing already exists in the database, skipping API call.');

      // Use existing filing to create the dto
      dto = convertToFilingDto(existingFiling[0]);
      dto.id = existingFiling[0].id;
      dto.sectionName = data.sectionName;
    } else {
      // Fetch from SEC API and save if no existing filing is found
      dto = await this.fetchAndSaveFilingFromApi(data);
    }

    // Emit the DTO for further processing
    this.client.emit('fetch_filing_10q', dto);
  }
}
