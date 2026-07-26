import type { JsonValidatorService } from './json-validator.service';
import { z } from 'zod';
import { logger } from '../logger';
import { metadataSchema, questionsSchema } from './schemas/import.schema';

const log = logger.module('JsonValidator');

export class JsonValidatorServiceImpl implements JsonValidatorService {
  async validateMetadata(jsonContent: any): Promise<boolean> {
    try {
      metadataSchema.parse(jsonContent);
      return true;
    } catch (error) {
      log.error('Metadata validation failed', error);
      throw new Error(`Metadata Validation Error: ${error instanceof z.ZodError ? error.errors.map(e => e.message).join(', ') : 'Unknown'}`);
    }
  }

  async validateQuestions(jsonContent: any[]): Promise<boolean> {
    try {
      questionsSchema.parse(jsonContent);
      
      // Additional semantic validation
      const ids = new Set<string>();
      const qNums = new Set<number>();
      for (const q of jsonContent) {
        if (ids.has(q.id)) throw new Error(`Duplicate Question ID found: ${q.id}`);
        if (qNums.has(q.questionNumber)) throw new Error(`Duplicate Question Number found: ${q.questionNumber}`);
        
        // Ensure correctOptionId actually matches one of the options
        const optionIds = new Set(q.options.map((opt: any) => opt.id || opt.label));
        if (!optionIds.has(q.answer.correctOptionId)) {
          throw new Error(`Question ${q.id}: correctOptionId '${q.answer.correctOptionId}' does not match any provided option id or label.`);
        }

        ids.add(q.id);
        qNums.add(q.questionNumber);
      }
      return true;
    } catch (error) {
      log.error('Questions validation failed', error);
      throw new Error(`Question Validation Error: ${error instanceof z.ZodError ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : (error as Error).message}`);
    }
  }

  async validateAnswerKey(_jsonContent: any): Promise<boolean> {
    // Deprecated in v1.1.0 (Enterprise Audit)
    // Answers are now strictly embedded within the question block.
    return true;
  }
}
