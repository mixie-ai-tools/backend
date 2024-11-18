import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { FetchService } from './fetch.service';
import { InsertableFilingDto } from '@app/common/dtos';

@Controller()
export class FetchController {
  constructor(private readonly fetchService: FetchService) {}

  @UsePipes(new ValidationPipe())
  @EventPattern('fetch_filing_10q')
  async handleFetchFiling10Q(@Payload() data: InsertableFilingDto) {
    await this.fetchService.fetchAndSummarizeFiling(data);
  }
}
