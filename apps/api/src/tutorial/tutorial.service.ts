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
    const codeTemplate = new PromptTemplate({
      template: `write a very short {language} function with {task}`,
      inputVariables: ['language', 'task'],
    });

    const codeChain = codeTemplate.pipe(this.llm);
    // const testChain = testTemplate.pipe(this.llm);

    const codeResponse = await codeChain.invoke({
      language: 'javascript',
      task: 'add two numbers',
    });

    const testTemplate = new PromptTemplate({
      template: 'Write a unit test in {language} for this code:\n {code}',
      inputVariables: ['language', 'code'],
    });


    const testResult = await testTemplate.invoke({
      language: 'javascript',
      code: codeResponse,
    });

    console.log(codeResponse);

    console.log(testResult);
  }
}
