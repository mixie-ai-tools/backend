import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@app/common/config';
import { drizzle } from 'drizzle-orm/postgres-js'; // Correct import path for Postgres.js
import * as postgres from 'postgres';

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
  ],
  exports: ['POSTGRES_DB'],
})
export class DatabaseModule {}

// import {
//   Injectable,
//   Inject,
//   OnModuleInit,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { OpenAIEmbeddings } from '@langchain/openai';
// import { TextLoader } from 'langchain/document_loaders/fs/text';
// import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
// import { MemoryVectorStore } from 'langchain/vectorstores/memory';
// import { Document } from 'langchain/document';
// import { SqlDatabase } from 'langchain/sql_db';
