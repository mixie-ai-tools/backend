import {
  Inject,
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { LMStudioClient } from '@lmstudio/sdk';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { Document } from 'langchain/document';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { v7 as uuidv7 } from 'uuid';


@Injectable()
export class LmStudioEmbeddingsService implements OnModuleInit{
  private lmStudioClient: LMStudioClient;
  private embeddingModel: any; // Replace `any` with the exact type from the SDK, if available.
  private llmModel : any;
  private readonly embeddingModelName = 'embed-model';
  private readonly llmModelName = 'llm-model';


  constructor(@Inject('POSTGRES_VECTOR_DB') private readonly vectorStore: PGVectorStore) {}

  async onModuleInit(): Promise<void> {
    this.lmStudioClient = new LMStudioClient();

    try {     
      this.embeddingModel = await this.lmStudioClient.embedding.get({
        identifier: this.embeddingModelName
      });
    } catch (e) {
      console.log('NO EMBEDDING MODEL AVAILABLE')
      console.log(e)
      this.embeddingModel = await this.lmStudioClient.embedding.load('text-embedding-nomic-embed-text-v1.5',{
        identifier: this.embeddingModelName
      });
    }

    try {
      this.llmModel = await this.lmStudioClient.llm.get(this.llmModelName);
    }catch(e){
      console.log('NO LLM AVAILABLE')
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
      const loader = new DirectoryLoader(
        '/home/edgar/Code/backend/_foo',
        { '.txt': (path) => new TextLoader(path) },
      );
      const docs: Document[] = await loader.load();

      const ids = docs.map(() => uuidv7());
      await this.vectorStore.addDocuments(docs, { ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Document processing failed: ${error.message}`,
      );
    }
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    try {
      await this.vectorStore.delete({ ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete documents: ${error.message}`,
      );
    }
  }

  async similaritySearch(query: string, topK: number, filter?: Record<string, any>) {
    try {
      const docs = await this.vectorStore.similaritySearch( query, topK, filter);
      const context = docs.map((doc) => doc.pageContent).join('\n');
      const prompt = `
        Question: ${query}
        Context: ${context}
        Answer:
      `;
    return await this.llmModel.respond([
      {role: 'user', content: prompt}
    ])
   
    } catch (error) {
      throw new InternalServerErrorException(
        `Response generation failed: ${error.message}`,
      );
    }
  }

}
