import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import {
  BaseVectorDatabase,
  ExtractChunkData,
  InsertChunkData,
} from '@llm-tools/embedjs-interfaces';
import createDebugMessages from 'debug';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import { vectors } from '@/schema';

@Injectable()
export class PostgresDbService implements BaseVectorDatabase, OnModuleInit {
  private readonly debug = createDebugMessages('embedjs:vector:PostgresDb');

  constructor(
    @Inject('POSTGRES_SERVICE') private readonly db: PostgresJsDatabase, // Use the Drizzle type
  ) {}

  async onModuleInit(): Promise<void> {
    // await this.init({ dimensions: 128 });
  }

  async init(): Promise<void> {}

  /**
   * Insert vector chunks into the database.
   */
  async insertChunks(chunks: InsertChunkData[]): Promise<number> {
    for (const chunk of chunks) {
      await this.db.insert(vectors).values({
        vector: chunk.vector,
        metadata: chunk.metadata,
        page_content: chunk.pageContent,
        unique_loader_id: chunk.metadata.uniqueLoaderId,
        source: chunk.metadata.source,
      });
    }

    this.debug(`Inserted ${chunks.length} vector chunks.`);
    return chunks.length;
  }

  /**
   * Perform similarity search based on a query vector.
   */

  async similaritySearch(
    query: number[],
    k: number,
  ): Promise<ExtractChunkData[]> {
    const results = await this.db
      .select({
        id: vectors.id,
        vector: vectors.vector,
        metadata: {
          id: vectors.id, // Assuming "id" is the unique vector ID
          uniqueLoaderId: vectors.uniqueLoaderId,
          source: vectors.source,
        },
        pageContent: vectors.pageContent,
        score: sql<number>`1 - (vector <=> ${query}::FLOAT8[])`,
      })
      .from(vectors)
      .orderBy(sql`vector <=> ${query}::FLOAT8[]`)
      .limit(k);

    return results.map((row) => ({
      score: row.score,
      pageContent: row.pageContent,
      metadata: {
        id: row.metadata.id.toString(), // Ensure `id` is a string
        uniqueLoaderId: row.metadata.uniqueLoaderId,
        source: row.metadata.source,
      },
    }));
  }

  async getVectorCount(): Promise<number> {
    const result = await this.db.execute(
      sql`SELECT COUNT(*) AS count FROM vectors;`,
    );

    return result.count;
  }

  /**
   * Delete all vectors associated with a specific uniqueLoaderId.
   */
  async deleteKeys(uniqueLoaderId: string): Promise<boolean> {
    const result = await this.db
      .delete(vectors)
      .where(sql`unique_loader_id = ${uniqueLoaderId}`);
    this.debug(
      `Deleted ${result.count} vectors with uniqueLoaderId: ${uniqueLoaderId}`,
    );
    return result.count > 0;
  }

  /**
   * Reset the database by deleting all vector records.
   */
  async reset(): Promise<void> {
    await this.db.delete(vectors);
    this.debug('All vectors have been deleted.');
  }

  // this.debug(`Initializing PostgreSQL with vector dimensions: ${dimensions}`);
  // await this.db.execute(sql`
  //   CREATE TABLE IF NOT EXISTS vectors (
  //     id SERIAL PRIMARY KEY,
  //     vector FLOAT8[],
  //     metadata JSONB,
  //     page_content TEXT,
  //     unique_loader_id VARCHAR,
  //     source TEXT
  //   );
  // `);
  // await this.db.execute(sql`
  //   CREATE EXTENSION IF NOT EXISTS vector;
  //   CREATE INDEX IF NOT EXISTS vector_index
  //   ON vectors USING ivfflat (vector vector_l2_ops);
  // `);
  // this.debug('Database schema and indexes are ready.');

  //   async init({ dimensions }: { dimensions: number }): Promise<void> {
  //     this.debug(`Initializing PostgreSQL with vector dimensions: ${dimensions}`);

  //     await this.db.execute(sql`
  //       CREATE TABLE IF NOT EXISTS vectors (
  //         id SERIAL PRIMARY KEY,
  //         vector FLOAT8[],
  //         metadata JSONB,
  //         page_content TEXT,
  //         unique_loader_id VARCHAR,
  //         source TEXT
  //       );
  //     `);

  //     await this.db.execute(sql`
  //       CREATE EXTENSION IF NOT EXISTS vector;
  //       CREATE INDEX IF NOT EXISTS vector_index
  //       ON vectors USING ivfflat (vector vector_l2_ops);
  //     `);

  //     this.debug('Database schema and indexes are ready.');
  //   }

  //   async similaritySearch(
  //     query: number[],
  //     k: number,
  //   ): Promise<ExtractChunkData[]> {
  //     const results = await this.db
  //       .select({
  //         id: vectors.id,
  //         vector: vectors.vector,
  //         metadata: vectors.metadata,
  //         pageContent: vectors.pageContent,
  //         score: sql<number>`1 - (vector <=> ${query}::FLOAT8[])`,
  //       })
  //       .from(vectors)
  //       .orderBy(sql`vector <=> ${query}::FLOAT8[]`)
  //       .limit(k);

  //     return results.map((row) => ({
  //       score: row.score,
  //       pageContent: row.pageContent,
  //       metadata: row.metadata as Record<string, string | number | boolean>, // Explicit cast
  //     }));
  //   }

  //   async similaritySearch(
  //     query: number[],
  //     k: number,
  //   ): Promise<ExtractChunkData[]> {
  //     const results = await this.db
  //       .select({
  //         id: vectors.id,
  //         vector: vectors.vector,
  //         metadata: vectors.metadata,
  //         pageContent: vectors.pageContent,
  //         score: sql<number>`1 - (vector <=> ${query}::FLOAT8[])`,
  //       })
  //       .from(vectors)
  //       .orderBy(sql`vector <=> ${query}::FLOAT8[]`)
  //       .limit(k);

  //     return results.map((row) => ({
  //       score: row.score,
  //       pageContent: row.pageContent,
  //       metadata: row.metadata,
  //     }));
  //   }
  /**
   * Get the total count of vectors stored in the database.
   */
}
