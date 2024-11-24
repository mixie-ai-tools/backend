// src/document/document.service.ts

import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // Import OpenAI client

@Injectable()
export class DocumentService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @Inject('DATABASE_CONNECTION') private readonly db: any, // Drizzle connection
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async naturalLanguageQuery(question: string) {
    const schemaDescription = `
Database Schema:
- Table customers (id, name, revenue)
- Table orders (id, customer_id, amount)
`;

    const prompt = `
You are an assistant that converts natural language questions into SQL queries for a PostgreSQL database.

${schemaDescription}

Given the following question, generate a safe SQL query.

Question: ${question}

SQL Query:
`;

    try {
      // Use OpenAI to generate SQL query
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4', // Or another model like 'text-davinci-003'
        messages: [{ role: 'user', content: prompt }],
      });

      const sqlQuery = response.choices[0]?.message?.content?.trim();
      console.log('Generated SQL Query:', sqlQuery);

      if (!sqlQuery) {
        throw new InternalServerErrorException('Failed to generate SQL query');
      }

      // Execute the generated SQL query using Drizzle
      const result = await this.db.execute(sqlQuery);
      return result.rows;
    } catch (error) {
      throw new InternalServerErrorException(`Error: ${error.message}`);
    }
  }
}
