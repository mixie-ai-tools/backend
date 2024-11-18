import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SecFilingPullDto } from '@app/common/dtos';

@Injectable()
export class FilingsService {
  constructor(
    @Inject('POSTGRES_SERVICE') private readonly db: PostgresJsDatabase,
    @Inject('RABBIT_MQ_SERVICE') private readonly client: ClientProxy,
  ) {
    this.client.connect();
  }

  async processFiling(data: SecFilingPullDto) {
    await this.client.emit('sec_filings_pull', data);
    return {
      message: 'Request Queued',
      data: data,
    };
  }
}
