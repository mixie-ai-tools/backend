import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@app/common/config';
import { drizzle } from 'drizzle-orm/postgres-js'; // Correct import path for Postgres.js
import * as postgres from 'postgres';
import { EmbeddingSpecificModel, LMStudioClient } from '@lmstudio/sdk';
import {
  PGVectorStore,
  DistanceStrategy,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';


class Foo {

  private lmStudioClient: LMStudioClient;
  private embeddingModel: EmbeddingSpecificModel;

  constructor(client: LMStudioClient) {
    this.lmStudioClient = client
  }

  async init() {

    const modelName = 'text-embedding-nomic-embed-text-v1.5';

    try {
      this.embeddingModel = await this.lmStudioClient.embedding.get(modelName);
    } catch (e) {
      this.embeddingModel = await this.lmStudioClient.embedding.load(modelName);
    }
  }


  async embedDocuments(documents: string[]): Promise<number[][]> {
    const results: number[][] = [];

    for (const document of documents) {
      // Simulate some processing that returns an array of numbers
      const embeddedDocument = await this.embedQuery(document);
      results.push(embeddedDocument);
    }
    return results;
  }

  async embedQuery(document: string): Promise<number[]> {
    const result = await this.embeddingModel.embedString(document);

    return result.embedding
  };
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'POSTGRES_DB',
      useFactory: (configService: ConfigService) => {
        // Initialize Postgres.js client
        const client = postgres({
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          user: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          ssl: false,
        });

        // Create Drizzle ORM instance with Postgres.js client
        const db = drizzle(client);
        return db;
      },
      inject: [ConfigService],
    },
    {
      provide: 'POSTGRES_VECTOR_DB',
      useFactory: async (configService: ConfigService) => {
        const config = {
          postgresConnectionOptions: {
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            user: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
          } as PoolConfig,
          tableName: 'vectors',
          columns: {
            idColumnName: 'id',
            vectorColumnName: 'vector',
            contentColumnName: 'content',
            metadataColumnName: 'metadata',
          },
          distanceStrategy: 'cosine' as DistanceStrategy,
        };

        const lmStudioClient = new LMStudioClient();


        const foo = new Foo(lmStudioClient);
        foo.init()
        // Initialize PGVectorStore
        const vectorStore = await PGVectorStore.initialize(
          foo,
          config,
        );

        return vectorStore
      },
      inject: [ConfigService],
    },
  ],
  exports: ['POSTGRES_DB', 'POSTGRES_VECTOR_DB'],
})
export class DatabaseModule { }

