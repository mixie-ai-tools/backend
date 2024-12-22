import { Injectable, OnModuleInit } from '@nestjs/common';
import { Ollama } from '@langchain/ollama'; //ChatOllama,
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class TutorialService implements OnModuleInit {
  private readonly llm: Ollama;
  //   private readonly llm2: ChatOllama;
  constructor() {
    this.llm = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.3:latest',
    });
    // new ChatOllama({
    //   baseUrl: 'http://localhost:11434',
    //   model: 'llama3.3:latest',
    // });
  }

  onModuleInit() {}

  async test() {
    const template = new PromptTemplate({
      template: `write a very short {language} function with {task}`,
      inputVariables: ['language', 'task'],
    });

    const chain = template.pipe(this.llm);
    const response = await chain.invoke({
      language: 'javascript',
      task: 'add two numbers',
    });
    console.log(response);
  }
}
