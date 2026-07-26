import type { ImportService } from './import.service';
import type { ZipExtractorService } from './zip-extractor.service';
import type { JsonValidatorService } from './json-validator.service';
import type { ImageLoaderService } from './image-loader.service';
import type { TestRepository } from '../database/repositories/test.repository';

import type { Database } from 'better-sqlite3';
import type { TestImportResult, ImportStep } from '../../shared/types/test.types';

import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import crypto from 'crypto';

const log = logger.module('ImportEngine');

export class ImportServiceImpl implements ImportService {
  constructor(
    private zipExtractor: ZipExtractorService,
    private jsonValidator: JsonValidatorService,
    private imageLoader: ImageLoaderService,
    private testRepo: TestRepository,
    private db: Database
  ) {}

  async importTestPackage(
    zipFilePath: string,
    onProgress: (step: ImportStep, label: string, progress: number) => void
  ): Promise<TestImportResult> {
    const result: TestImportResult = {
      success: false,
      testId: null,
      testSummary: null,
      errors: [],
      warnings: []
    };

    let tempDir = '';
    let newTestId = uuidv4();

    try {
      // 1. Extract ZIP
      onProgress('extracting', 'Extracting package...', 10);
      tempDir = await this.zipExtractor.extract(zipFilePath);

      // 2. Read Metadata
      onProgress('reading_metadata', 'Reading metadata...', 20);
      const metadataPath = path.join(tempDir, 'metadata.json');
      const questionsPath = path.join(tempDir, 'questions.json');
      
      const metadataStr = await fs.readFile(metadataPath, 'utf-8');
      const metadataObj = JSON.parse(metadataStr);

      // 3. Validate Metadata
      onProgress('validating', 'Validating metadata...', 30);
      await this.jsonValidator.validateMetadata(metadataObj);

      // 4. Read & Validate Questions
      onProgress('reading_questions', 'Reading questions...', 40);
      const questionsStr = await fs.readFile(questionsPath, 'utf-8');
      const questionsArr = JSON.parse(questionsStr);
      
      onProgress('validating', 'Validating questions schema...', 50);
      await this.jsonValidator.validateQuestions(questionsArr);

      // 5. Load Images
      onProgress('loading_images', 'Copying images...', 60);
      await this.imageLoader.processTestImages(tempDir, newTestId);

      // 6. Database Transaction
      onProgress('saving', 'Saving to database...', 80);
      
      const packageHash = this.generateHash(metadataStr + questionsStr);

      await this.performDatabaseImport(newTestId, packageHash, metadataObj, questionsArr);

      // 7. Cleanup & Finish
      onProgress('ready', 'Finalizing...', 95);
      await this.zipExtractor.cleanup(tempDir);

      const testSummary = await this.testRepo.getTestById(newTestId);
      
      result.success = true;
      result.testId = newTestId;
      if (testSummary) {
        result.testSummary = {
          id: testSummary.id,
          name: testSummary.name,
          totalQuestions: testSummary.totalQuestions,
          durationMinutes: testSummary.durationMinutes,
          maxMarks: testSummary.maxMarks,
          subjectDistribution: testSummary.subjectDistribution,
          importDate: testSummary.importDate,
          totalImages: 0,
          sessionsCount: 0,
          lastAttemptDate: null
        };
      }

      onProgress('ready', 'Import successful', 100);
      return result;

    } catch (error) {
      log.error('Import Pipeline failed', error);
      
      if (tempDir) {
        await this.zipExtractor.cleanup(tempDir).catch(e => log.error('Failed to cleanup temp dir after error', e));
      }
      
      // Rollback images if we failed midway
      if (newTestId) {
        await this.imageLoader.deleteTestImages(newTestId).catch(e => log.error('Failed to cleanup images after error', e));
      }

      result.errors.push(error instanceof Error ? error.message : 'Unknown import error');
      return result;
    }
  }

  private async performDatabaseImport(testId: string, packageHash: string, metadata: any, questions: any[]) {
    // Needs to be atomic. better-sqlite3 handles transactions synchronously.
    const importTx = this.db.transaction(() => {
      // 1. Insert Test
      this.db.prepare(`
        INSERT INTO tests (id, package_hash, name, description, duration_minutes, max_marks, negative_marking_ratio, subject_distribution_json, source, year, version, author, instructions, language, exam_type, scoring_rules_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        testId, packageHash, metadata.name, metadata.description, metadata.durationMinutes, metadata.maxMarks, metadata.negativeMarkingRatio,
        JSON.stringify(metadata.subjectDistribution), metadata.source || null, metadata.year || null, metadata.version, metadata.author || null,
        metadata.instructions || null, metadata.language, metadata.examType, JSON.stringify(metadata.scoringRules)
      );

      // Prepared Statements for rapid execution
      const checkQuestionStmt = this.db.prepare('SELECT id FROM questions WHERE content_hash = ?');
      const insertQuestionStmt = this.db.prepare(`
        INSERT INTO questions (
          id, subtopic_id, difficulty, question_type, marks, negative_marks, expected_time_seconds,
          question_text, question_image_path, additional_images_json,
          tags_json, content_hash, correct_option_id, explanation, concept_tested, common_mistakes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertOptionStmt = this.db.prepare(`
        INSERT INTO options (id, question_id, option_label, option_text, option_image_path, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const insertSolutionImageStmt = this.db.prepare(`
        INSERT INTO solution_images (id, question_id, image_path, display_order)
        VALUES (?, ?, ?, ?)
      `);
      const mapTestQuestionStmt = this.db.prepare('INSERT INTO test_questions (test_id, question_id, question_number) VALUES (?, ?, ?)');

      // 2. Process Questions
      for (const q of questions) {
        // Resolve Taxonomy
        const subjId = this.ensureSubject(q.subject);
        const topicId = this.ensureTopic(q.topic, subjId, q.chapter);
        const subtopicId = this.ensureSubtopic(q.subtopic, topicId);

        // Hash question content to deduplicate
        const contentHash = this.generateHash(JSON.stringify({ text: q.questionText, options: q.options }));
        
        let dbQuestionId = q.id;

        // Check if question exists
        const existingQ = checkQuestionStmt.get(contentHash) as any;
        
        if (existingQ) {
          dbQuestionId = existingQ.id; // Reuse
        } else {
          // Insert Question
          insertQuestionStmt.run(
            dbQuestionId, subtopicId, q.difficulty, q.questionType, q.answer.marks, q.answer.negativeMarks, q.expectedTimeSeconds,
            q.questionText, q.questionImage || null, JSON.stringify(q.additionalImages || []),
            JSON.stringify(q.tags || []), contentHash,
            q.answer.correctOptionId, q.answer.explanation || null, q.answer.conceptTested || null, q.answer.commonMistakes || null
          );
          
          let order = 0;
          for (const opt of q.options) {
            insertOptionStmt.run(
              opt.id || uuidv4(), dbQuestionId, opt.label || 'A', opt.text, opt.image || null, order++
            );
          }

          // Insert Solution Images
          if (q.answer.solutionImages && q.answer.solutionImages.length > 0) {
            let imgOrder = 0;
            for (const imgPath of q.answer.solutionImages) {
              insertSolutionImageStmt.run(uuidv4(), dbQuestionId, imgPath, imgOrder++);
            }
          }
        }

        // Map Question to Test
        mapTestQuestionStmt.run(testId, dbQuestionId, q.questionNumber);
      }
      
      // 3. Log History
      this.db.prepare('INSERT INTO import_history (id, test_id, action, status, details_json) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), testId, 'IMPORT', 'SUCCESS', JSON.stringify({ questionsCount: questions.length }));
    });

    importTx();
  }

  // --- Helper Methods for Normalization --- //
  
  private ensureSubject(name: string): string {
    let row = this.db.prepare('SELECT id FROM subjects WHERE name = ?').get(name) as any;
    if (!row) {
      const id = uuidv4();
      this.db.prepare('INSERT INTO subjects (id, name) VALUES (?, ?)').run(id, name);
      return id;
    }
    return row.id;
  }

  private ensureTopic(name: string, subjectId: string, chapter: string): string {
    let row = this.db.prepare('SELECT id FROM topics WHERE name = ? AND subject_id = ?').get(name, subjectId) as any;
    if (!row) {
      const id = uuidv4();
      this.db.prepare('INSERT INTO topics (id, subject_id, name, chapter_name) VALUES (?, ?, ?, ?)').run(id, subjectId, name, chapter);
      return id;
    }
    return row.id;
  }

  private ensureSubtopic(name: string, topicId: string): string {
    let row = this.db.prepare('SELECT id FROM subtopics WHERE name = ? AND topic_id = ?').get(name, topicId) as any;
    if (!row) {
      const id = uuidv4();
      this.db.prepare('INSERT INTO subtopics (id, topic_id, name) VALUES (?, ?, ?)').run(id, topicId, name);
      return id;
    }
    return row.id;
  }

  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
