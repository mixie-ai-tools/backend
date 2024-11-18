import { Controller, Get, Query } from '@nestjs/common';
import { FilingsService } from '@/api/src/filings/filings.service';
import { SecFilingPullDto } from '@app/common/dtos';
import { ValidationPipe } from '@nestjs/common';

@Controller('filings')
export class FilingsController {
  constructor(private readonly filingsService: FilingsService) {}

  @Get()
  async getFilings(
    @Query(new ValidationPipe({ transform: true })) query: SecFilingPullDto,
  ) {
    try {
      return await this.filingsService.processFiling(query);
    } catch (error) {
      return { error: 'Failed to fetch filings', details: error.message };
    }
  }
}

// GOOGL
// http://127.0.0.1:3000/filings?year=2024&month=4&ticker=GOOGL&formType=10-Q
// http://127.0.0.1:3000/filings?year=2024&month=4&ticker=GOOG&formType=10-Q

//part1item1, part1item2, part1item3, part1item4, part2item1, part2item1a, part2item2, part2item3, part2item4, part2item5, part2item6

// Supported 10-Q Section Items
// All 10-Q section items are supported:

// Part 1:
// 1 - Financial Statements
// 2 - Management’s Discussion and Analysis of Financial Condition and Results of Operations
// 3 - Quantitative and Qualitative Disclosures About Market Risk
// 4 - Controls and Procedures
// Part 2:
// 1 - Legal Proceedings
// 1A - Risk Factors
// 2 -Unregistered Sales of Equity Securities and Use of Proceeds
// 3 - Defaults Upon Senior Securities
// 4 - Mine Safety Disclosures
// 5 - Other Information
// 6 - Exhibits
