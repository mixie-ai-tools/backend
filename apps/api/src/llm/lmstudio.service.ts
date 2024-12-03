import {
  Inject, Injectable, OnModuleInit, OnModuleDestroy,
  InternalServerErrorException
} from '@nestjs/common';
import { LMStudioClient } from '@lmstudio/sdk';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from 'langchain/document';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class LmStudioEmbeddingsService implements OnModuleInit, OnModuleDestroy {
  private lmStudioClient: LMStudioClient;
  private embeddingModel: any; // Replace `any` with the exact type from the SDK, if available.
  private readonly modelName = 'text-embedding-nomic-embed-text-v1.5'; // Example model name

  constructor(@Inject('POSTGRES_VECTOR_DB') private readonly vectorStore: PGVectorStore,) {

  }
  async onModuleInit(): Promise<void> {
    this.lmStudioClient = new LMStudioClient();

    try {
      this.embeddingModel = await this.lmStudioClient.embedding.get(this.modelName);
    } catch (e) {
      this.embeddingModel = await this.lmStudioClient.embedding.load(this.modelName);
    }
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      throw new Error('Embedding model is not initialized.');
    }

    const emb = await this.embeddingModel.embedString(text);
    return emb.embedding;
  }

  async processDocuments() {
    try {
      // Load text documents from a directory
      const loader = new DirectoryLoader(
        '/home/edgar/Code/backend/_foo',
        {
          '.txt': (path) => new TextLoader(path),
        },
      );
      const docs: Document[] = await loader.load();

      // Generate unique IDs for the documents
      const ids = docs.map(() => uuidv7());
      console.log(ids, docs)

      // Add documents to the PGVectorStore
      const d = await this.vectorStore.addDocuments(docs, { ids });
      return d;

      // // Example query
      // const query = 'What is the capital of France?';

      // // Perform a similarity search
      // const results = await this.vectorStore.similaritySearch(query, 3);

      // return results;
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

  async onModuleDestroy(): Promise<void> {
    if (this.embeddingModel) {
      await this.lmStudioClient.embedding.unload(this.modelName);
    }
  }
}
