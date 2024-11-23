import { Injectable, Logger } from '@nestjs/common';
import { LlmQueryDto } from '@app/common/dtos';

@Injectable()
export class EmbeddingsService {
  createEmbeddings(llmQuery: LlmQueryDto): void {
    // todo: create embeddings
    // doto: call retrieveVecorData
    // finally send this to the LLM for processing
    Logger.log(`testing ${llmQuery.query}`);
  }

  // todo: retrive vector data from postgres
  retriveVectorData() {}

  // todo: implement event data sending to llm service
  sendToLlm() {}
}
