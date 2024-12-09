import {
  Inject,
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { LMStudioClient } from '@lmstudio/sdk';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from 'langchain/document';
import { v7 as uuidv7 } from 'uuid';
import { ChatHistory, ChatMessage } from '@lmstudio/sdk';

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
      const docs = await this.vectorStore.similaritySearch(query, topK, filter);
      const context = docs.map((doc) => doc.pageContent).join('\n');
     
      const prompt = `
        Question: ${query}
        Products and Context: ${context}
      `;

      const systemPrompt = `You are a friendly and helpful assistant designed to assist customers in finding products in our Shopify store. Your main goal is to provide accurate and relevant information about our products. Here are some guidelines for your interactions:

1. **Greet the User**: Always start by saying "Hello! How can I help you find something today?"
2. **Understand User Needs**: Ask clarifying questions if needed to understand what the user is looking for. For example, "Are you looking for a specific type of product, such as clothing or electronics?"
3. **Provide Product Information**:
   - Use clear and concise language.
   - Mention key features, prices, and availability.
   - If there are multiple options, suggest a few choices.
4. **Offer Help with Additional Queries**: If the user has more questions after your initial response, continue to assist them until they find what they need or decide to stop.
5. **Be Polite and Helpful**: Always be friendly and offer assistance even if you can't find an exact match for their request.
6. **Encourage Further Interaction**: Suggest that users visit the store website for more details or to make a purchase. For example, "You can check out our full collection on please accept this cookie."
7. **Follow Up**: If the user seems unsure or if they need more help, follow up with additional questions or information.

`;

      const chatHistory = ChatHistory.createEmpty();

      chatHistory.append('system', systemPrompt);
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
      // Create documents from the products data
      const docs: Document[] = productsData.map((product) => {
        return new Document({
          pageContent: product.node.description,
          metadata: { title: product.node.title, id: product.node.id },
        });
      });

      // Generate unique IDs for the documents
      const ids = docs.map(() => uuidv7());

      // Add documents to the PGVectorStore
      await this.vectorStore.addDocuments(docs, { ids });

    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to add Shopify products to vector store: ${error.message}`,
      );
    }
  }
}
