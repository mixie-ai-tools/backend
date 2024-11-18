// fetch.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { InsertableFilingDto } from '@app/common/dtos';
import { OpenAI } from 'openai';
import { form10QSectionsTable } from '@/schema'; // Ensure correct import paths
import { eq, and } from 'drizzle-orm/expressions'; // Import eq and and for querying
import { InferInsertModel } from 'drizzle-orm'; // Import InferInsertModel
import { FetchDataService } from './fetch-data.service';
import { Filing10QService } from './filing10q.service';

type Form10QSection = InferInsertModel<typeof form10QSectionsTable>;

@Injectable()
export class FetchService {
  private openai: OpenAI;
  private stopwords: Set<string>;

  constructor(
    @Inject('POSTGRES_SERVICE') private readonly db: PostgresJsDatabase,
    private readonly fetchDataService: FetchDataService,
    private readonly filing10QService: Filing10QService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.stopwords = new Set([
      // Comprehensive list of stopwords
      'i',
      'me',
      'my',
      'myself',
      'we',
      'us',
      'our',
      'ours',
      'ourselves',
      'you',
      'your',
      'yours',
      'yourself',
      'yourselves',
      'he',
      'him',
      'his',
      'himself',
      'she',
      'her',
      'hers',
      'herself',
      'it',
      'its',
      'itself',
      'they',
      'them',
      'their',
      'theirs',
      'themselves',
      'what',
      'which',
      'who',
      'whom',
      'whose',
      'this',
      'that',
      'these',
      'those',
      'am',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'having',
      'do',
      'does',
      'did',
      'doing',
      'will',
      'would',
      'should',
      'can',
      'could',
      'ought',
      "i'm",
      "you're",
      "he's",
      "she's",
      "it's",
      "we're",
      "they're",
      "i've",
      "you've",
      "we've",
      "they've",
      "i'd",
      "you'd",
      "he'd",
      "she'd",
      "we'd",
      "they'd",
      "i'll",
      "you'll",
      "he'll",
      "she'll",
      "we'll",
      "they'll",
      "isn't",
      "aren't",
      "wasn't",
      "weren't",
      "hasn't",
      "haven't",
      "hadn't",
      "doesn't",
      "don't",
      "didn't",
      "won't",
      "wouldn't",
      "shan't",
      "shouldn't",
      "can't",
      'cannot',
      "couldn't",
      "mustn't",
      "let's",
      "that's",
      "who's",
      "what's",
      "here's",
      "there's",
      "when's",
      "where's",
      "why's",
      "how's",
      'a',
      'an',
      'the',
      'and',
      'but',
      'if',
      'or',
      'because',
      'as',
      'until',
      'while',
      'of',
      'at',
      'by',
      'for',
      'with',
      'about',
      'against',
      'between',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'to',
      'from',
      'up',
      'upon',
      'down',
      'in',
      'out',
      'on',
      'off',
      'over',
      'under',
      'again',
      'further',
      'then',
      'once',
      'here',
      'there',
      'when',
      'where',
      'why',
      'how',
      'all',
      'any',
      'both',
      'each',
      'few',
      'more',
      'most',
      'other',
      'some',
      'such',
      'no',
      'nor',
      'not',
      'only',
      'own',
      'same',
      'so',
      'than',
      'too',
      'very',
      'say',
      'says',
      'said',
      'shall',
    ]);
  }

  private chunkText(text: string, maxChunkLength: number): string[] {
    const chunks = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
      chunks.push(
        text.slice(currentPosition, currentPosition + maxChunkLength),
      );
      currentPosition += maxChunkLength;
    }

    return chunks;
  }

  private async summarizeChunk(chunk: string, sectionName: string) {
    try {
      const prompt = this.filing10QService.getPromptForSection(sectionName);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nFiling Content:\n"""${chunk}"""`,
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error summarizing chunk:', error);
      throw error;
    }
  }

  private generateWordCloud(
    text: string,
  ): Array<{ text: string; size: number }> {
    // Remove punctuation and convert to lowercase
    const cleanedText = text.replace(/[^\w\s]/g, '').toLowerCase();

    // Split into words
    const words = cleanedText.split(/\s+/);

    // Filter out stopwords and very short words
    const filteredWords = words.filter(
      (word) => word.length > 2 && !this.stopwords.has(word),
    );

    // Count word frequencies
    const wordFrequency: { [key: string]: number } = {};
    filteredWords.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Convert to array and sort by frequency
    const wordCloudData = Object.keys(wordFrequency).map((word) => ({
      text: word,
      size: wordFrequency[word],
    }));

    // Optionally sort the words by frequency in descending order
    wordCloudData.sort((a, b) => b.size - a.size);

    return wordCloudData;
  }

  async fetchAndSummarizeFiling(dto: InsertableFilingDto): Promise<void> {
    try {
      const sectionName = dto.sectionName;

      // Check if the record already exists
      const existingSection = await this.db
        .select()
        .from(form10QSectionsTable)
        .where(
          and(
            eq(form10QSectionsTable.filingId, dto.id),
            eq(form10QSectionsTable.sectionName, sectionName),
          ),
        )
        .execute()
        .then((rows) => rows[0]);

      if (existingSection) {
        Logger.log(
          `Section "${sectionName}" for filing ID ${dto.id} already exists. Skipping processing.`,
        );
        return; // Skip processing if the record exists
      }

      // Fetch text using FetchDataService
      const filingText = await this.fetchDataService.fetchFilingText(
        dto.linkToTxt,
        sectionName,
      );

      // Split the fetched text into chunks and summarize each chunk
      const chunks = this.chunkText(filingText, 1500);
      const summaries = await Promise.all(
        chunks.map((chunk) => this.summarizeChunk(chunk, sectionName)),
      );

      // Consolidate summaries into a single summary text
      const combinedSummary = summaries.join(' ');

      Logger.log(combinedSummary, filingText);

      // Generate word cloud data
      const wordCloudData = this.generateWordCloud(filingText);

      const sectionData: Form10QSection = {
        filingId: dto.id,
        sectionName: sectionName,
        originalText: filingText,
        summaryText: combinedSummary ?? '',
        wordCloud: wordCloudData, // Include the word cloud data here
        // createdAt is auto-handled
      };

      await this.db.insert(form10QSectionsTable).values(sectionData).execute();
    } catch (error) {
      console.error('Error processing the filing:', error);
    }
  }
}
