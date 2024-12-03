import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@app/common/config';
import { drizzle } from 'drizzle-orm/postgres-js'; // Correct import path for Postgres.js
import * as postgres from 'postgres';
import { LMStudioClient } from '@lmstudio/sdk';
import {
  PGVectorStore,
  DistanceStrategy,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { EmbeddingModel } from './classes/embedding-model';

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

        const embeddingService = new EmbeddingModel(lmStudioClient);
        await embeddingService.init();

        // Initialize PGVectorStore
        const vectorStore = await PGVectorStore.initialize(embeddingService, config);

        return vectorStore;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['POSTGRES_DB', 'POSTGRES_VECTOR_DB'],
})
export class DatabaseModule {}
