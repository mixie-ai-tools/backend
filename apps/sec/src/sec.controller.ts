import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SecService } from '@/sec/src/sec.service';
import { SecFilingPullDto } from '@app/common/dtos';

@Controller()
export class SecController {
  constructor(private readonly secService: SecService) {}

  @UsePipes(new ValidationPipe())
  @EventPattern('sec_filings_pull')
  async SecFilingsFull(@Payload() data: SecFilingPullDto) {
    await this.secService.getAndSaveFiling(data);
  }
}
