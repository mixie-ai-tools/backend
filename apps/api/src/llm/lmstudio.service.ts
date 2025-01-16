import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from 'langchain/document';
import { v7 as uuidv7 } from 'uuid';
import { ChatHistory } from '@lmstudio/sdk';
import { UpdateChatDto } from './dto/chat-update.dto';
import { ModelProvider } from './model.provider';

@Injectable()
export class LmStudioEmbeddingsService {
  private readonly embeddingModel: any;
  private readonly llmModel: any;

  constructor(
    @Inject('POSTGRES_VECTOR_DB') private readonly vectorStore: PGVectorStore,
    @Inject('MODEL_PROVIDER') modelProvider: ModelProvider,
  ) {
    this.embeddingModel = modelProvider.getEmbeddingModel();
    this.llmModel = modelProvider.getLLMModel();
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.embeddingModel) {
      throw new Error('Embedding model is not initialized.');
    }

    const emb = await this.embeddingModel.embedString(text);
    return emb.embedding;
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

  async similaritySearch(
    updateChatDto: UpdateChatDto,
    topK: number,
    filter?: Record<string, any>,
  ) {
    try {
      const { chatBlob } = updateChatDto;
      const query = chatBlob[chatBlob.length - 1].user;

      if (!query) return;

      const docs = await this.vectorStore.similaritySearch(query, topK, filter);
      const context = docs.map((doc) => doc.pageContent).join('\n');

      const prompt = `
        Question: ${query}
        Products and Context: ${context}
      `;

      const chatHistory = ChatHistory.createEmpty();

      for (let i = 0; i < chatBlob.length - 1; i++) {
        if (chatBlob[i].system) {
          chatHistory.append('system', chatBlob[i].system);
        }
        if (chatBlob[i].user) {
          chatHistory.append('user', chatBlob[i].user);
        }
        if (chatBlob[i].assistant) {
          chatHistory.append('assistant', chatBlob[i].assistant);
        }
      }

      chatHistory.append('user', prompt);
      const resp = await this.llmModel.respond(chatHistory);
      return resp;
    } catch (error) {
      throw new InternalServerErrorException(
        `Response generation failed: ${error.message}`,
      );
    }
  }

  async addShopifyProductsToVectorStore(productsData: any[]): Promise<void> {
    try {
      const docs: Document[] = productsData.map((product) => {
        return new Document({
          pageContent: product.node.description,
          metadata: { title: product.node.title, id: product.node.id },
        });
      });

      const ids = docs.map(() => uuidv7());

      await this.vectorStore.addDocuments(docs, { ids });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to add Shopify products to vector store: ${error.message}`,
      );
    }
  }
}
