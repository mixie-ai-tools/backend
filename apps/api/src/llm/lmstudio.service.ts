import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { LMStudioClient } from '@lmstudio/sdk';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from 'langchain/document';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { v7 as uuidv7 } from 'uuid';
import { contents } from 'cheerio/dist/commonjs/api/traversing';


@Injectable()
export class LmStudioEmbeddingsService implements OnModuleInit, OnModuleDestroy {
  private lmStudioClient: LMStudioClient;
  private embeddingModel: any; // Replace `any` with the exact type from the SDK, if available.
  private llmModel : any;
  private readonly embeddingModelName = 'text-embedding-nomic-embed-text-v1.5'; // Example model name
  private readonly llmModelName = 'hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF';//'Qwen/Qwen2.5-Coder-32B-Instruct-GGUF'


  constructor(@Inject('POSTGRES_VECTOR_DB') private readonly vectorStore: PGVectorStore) {}

  async onModuleInit(): Promise<void> {
    this.lmStudioClient = new LMStudioClient();

    try {
      this.embeddingModel = await this.lmStudioClient.embedding.get(this.embeddingModelName);
    } catch (e) {
      this.embeddingModel = await this.lmStudioClient.embedding.load(this.embeddingModelName);
    }

    try {
      this.llmModel = await this.lmStudioClient.llm.get(this.llmModelName);
    }catch(e){
      this.llmModel = await this.lmStudioClient.llm.load(this.llmModelName);
    }
  }



  async embedText(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      throw new Error('Embedding model is not initialized.');
    }

    const emb = await this.embeddingModel.embedString(text);
    return emb.embedding;
  }

  async processDocuments(): Promise<void> {
    try {
      // Load text documents from a directory
      const loader = new DirectoryLoader(
        '/home/edgar/Code/backend/_foo',
        { '.txt': (path) => new TextLoader(path) },
      );
      const docs: Document[] = await loader.load();

      // Generate unique IDs for the documents
      const ids = docs.map(() => uuidv7());

      // Add documents to the PGVectorStore
      await this.vectorStore.addDocuments(docs, { ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Document processing failed: ${error.message}`,
      );
    }
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    try {
      // Delete documents from the vector store by IDs
      await this.vectorStore.delete({ ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete documents: ${error.message}`,
      );
    }
  }

  async similaritySearch(query: string, topK: number, filter?: Record<string, any>) {
    try {
      // Retrieve relevant documents
      const docs = await this.vectorStore.similaritySearch( query, topK, filter);

      // Concatenate document contents
      const context = docs.map((doc) => doc.pageContent).join('\n');

      // Create the prompt
      const prompt = `
        Question: ${query}
        Context: ${context}
        Answer:
      `;

      console.log(this.llmModel.model);
      // console.log(prompt)
    return await this.llmModel.respond([
      {role: 'user', content: prompt}
    ])
   
    } catch (error) {
      throw new InternalServerErrorException(
        `Response generation failed: ${error.message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.embeddingModel) {
      await this.lmStudioClient.embedding.unload(this.embeddingModelName);
      await this.lmStudioClient.llm.unload(this.llmModelName);
    }
  }
}
