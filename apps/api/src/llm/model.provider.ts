// lmstudio-provider.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LMStudioClient } from '@lmstudio/sdk'; // Adjust the import based on your actual SDK

@Injectable()
export class ModelProvider implements OnModuleInit {
    private embeddingModel: any; // Adjust the type based on your actual model
    private llmModel: any; // Adjust the type based on your actual model

    constructor(
        private readonly lmStudioClient: LMStudioClient,
        private readonly embeddingModelName: string,
        private readonly llmModelName: string,
    ) { }

    async onModuleInit(): Promise<void> {
        try {
            this.embeddingModel = await this.lmStudioClient.embedding.get({
                identifier: this.embeddingModelName,
            });
        } catch (e) {
            console.log('NO EMBEDDING MODEL AVAILABLE');

        }

        try {
            this.llmModel = await this.lmStudioClient.llm.get({
                identifier: this.llmModelName
            });
        } catch (e) {
            console.log('NO LLM AVAILABLE');
        }
    }

    getLMSudioClient() {
        return this.lmStudioClient;
    }

    getEmbeddingModel() {
        return this.embeddingModel;
    }

    getLLMModel() {
        return this.llmModel;
    }
}
