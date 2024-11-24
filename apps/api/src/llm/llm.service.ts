import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { LlmQueryDto } from '@app/common/dtos';

@Injectable()
export class LlmService {
  constructor(
    @Inject('POSTGRES_DB') private readonly db: PostgresJsDatabase,
    @Inject('RABBITMQ') private readonly client: ClientProxy,
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

  //
}
