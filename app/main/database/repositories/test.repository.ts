/**
 * TestRepository interface
 * Handles CRUD operations for tests and metadata
 */

import type { Test, TestSummary } from '../../../shared/types/test.types';

export interface TestRepository {
  /**
   * Retrieves all available tests as a summary list
   */
  getAllTests(): Promise<TestSummary[]>;

  /**
   * Retrieves full details for a specific test
   * @param testId The UUID of the test
   */
  getTestById(testId: string): Promise<Test | null>;

  /**
   * Creates a new test record (called during import)
   * @param test Full test object
   */
  createTest(test: Test): Promise<void>;

  /**
   * Deletes a test and all its associated data (cascade)
   * @param testId The UUID of the test to delete
   */
  deleteTest(testId: string): Promise<boolean>;

  /**
   * Updates test metadata
   * @param testId The UUID of the test
   * @param metadata Partial metadata to update
   */
  updateTestMetadata(testId: string, metadata: Partial<Test>): Promise<boolean>;
}
