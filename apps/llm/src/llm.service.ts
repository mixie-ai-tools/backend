import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  getHello(): string {
    return 'Hello World!';
  }
}
