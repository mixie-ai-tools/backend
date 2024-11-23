import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { LlmQueryDto } from '@app/common/dtos';

@Injectable()
export class LlmService {
  constructor(
    @Inject('POSTGRES_SERVICE') private readonly db: PostgresJsDatabase,
    @Inject('RABBIT_MQ_SERVICE') private readonly client: ClientProxy,
  ) {
    this.client.connect();
  }

  async queryToEmbedding(llmQuery: LlmQueryDto) {
    await this.client.emit('embeddings.process_query', llmQuery);
    return {
      message: 'Request Queued',
      data: llmQuery,
    };
  }
}
