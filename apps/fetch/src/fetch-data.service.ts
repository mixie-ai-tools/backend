// fetch-data.service.ts
import { Injectable } from '@nestjs/common';
import * as secApi from 'sec-api';

@Injectable()
export class FetchDataService {
  private extractorApi: typeof secApi.extractorApi;

  constructor() {
    // Set up SEC API with your API key from environment variables
    secApi.setApiKey(process.env.SEC_API_KEY);
    this.extractorApi = secApi.extractorApi;
  }

  /**
   * Fetches the original text for a given filing section from the SEC API.
   * @param url - The filing URL to fetch data from.
   * @param sectionCode - The section code to fetch (e.g., '1A', 'fullDocument').
   * @returns The text content of the specified section.
   */
  async fetchFilingText(url: string, sectionCode: string): Promise<string> {
    try {
      const format = 'text'; // Fetches data in plain text format
      const filingText = await this.extractorApi.getSection(
        url,
        sectionCode,
        format,
      );
      return filingText;
    } catch (error) {
      console.error('Error fetching filing text from SEC API:', error);
      throw error;
    }
  }
}
