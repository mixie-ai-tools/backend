import { EmbeddingSpecificModel, LMStudioClient } from '@lmstudio/sdk';

export class EmbeddingModel {
  private lmStudioClient: LMStudioClient;
  private embeddingModel: EmbeddingSpecificModel;

  constructor(client: LMStudioClient) {
    this.lmStudioClient = client;
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
    return result.embedding;
  }
}
