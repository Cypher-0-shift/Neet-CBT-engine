/**
 * ImportService interface
 * Orchestrates the full ZIP to DB pipeline
 */

import type { TestImportResult, ImportStep } from '../../shared/types/test.types';

export interface ImportService {
  /**
   * Starts the import pipeline for a given ZIP file
   * @param zipFilePath Absolute path to the .zip file
   * @param onProgress Callback function for progress updates
   */
  importTestPackage(
    zipFilePath: string,
    onProgress: (step: ImportStep, label: string, progress: number) => void
  ): Promise<TestImportResult>;
}
