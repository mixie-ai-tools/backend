import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from 'langchain/document';
import {
  PGVectorStore,
  DistanceStrategy,
} from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService implements OnModuleInit {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: PGVectorStore;

  constructor(private readonly configService: ConfigService) {
    const openAIApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.embeddings = new OpenAIEmbeddings({ openAIApiKey });
  }

  async onModuleInit() {
    try {
      // PGVectorStore configuration
      const config = {
        postgresConnectionOptions: {
          host: this.configService.get<string>('DATABASE_HOST'),
          port: this.configService.get<number>('DATABASE_PORT'),
          user: this.configService.get<string>('DATABASE_USER'),
          password: this.configService.get<string>('DATABASE_PASSWORD'),
          database: this.configService.get<string>('DATABASE_NAME'),
        } as PoolConfig,
        tableName: 'vectors', // Your desired table name
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'vector',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
        distanceStrategy: 'cosine' as DistanceStrategy,
      };

      // Initialize PGVectorStore
      this.vectorStore = await PGVectorStore.initialize(
        this.embeddings,
        config,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to initialize PGVectorStore: ${error.message}`,
      );
    }
  }

  async processDocuments() {
    try {
      // Load text documents from a directory
      const loader = new DirectoryLoader(
        '/Users/edgarmartinez/Code/home-office-fund/_foo',
        {
          '.txt': (path) => new TextLoader(path),
        },
      );
      const docs: Document[] = await loader.load();

      // Generate unique IDs for the documents
      const ids = docs.map(() => uuidv4());

      // Add documents to the PGVectorStore
      await this.vectorStore.addDocuments(docs, { ids });

      // Example query
      const query = 'What is the capital of France?';

      // Perform a similarity search
      const results = await this.vectorStore.similaritySearch(query, 3);

      return results;
    } catch (error) {
      throw new InternalServerErrorException(
        `Document processing failed: ${error.message}`,
      );
    }
  }

  async search(query: string, topK: number, filter?: Record<string, any>) {
    try {
      // Perform a similarity search with optional filtering
      const results = await this.vectorStore.similaritySearch(
        query,
        topK,
        filter,
      );
      return results;
    } catch (error) {
      throw new InternalServerErrorException(`Search failed: ${error.message}`);
    }
  }

  async deleteDocuments(ids: string[]) {
    try {
      // Delete documents from the vector store by IDs
      await this.vectorStore.delete({ ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete documents: ${error.message}`,
      );
    }
  }
}
