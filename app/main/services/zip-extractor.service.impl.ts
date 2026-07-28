import type { ZipExtractorService } from './zip-extractor.service';
import type { ImportStep } from '../../shared/types/test.types';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';

const log = logger.module('ZipExtractor');

// ---------------------------------------------------------------------------
// Concurrency limiter
// ---------------------------------------------------------------------------

/**
 * Runs an array of async task factories with at most `limit` tasks in flight
 * at any given time, resolving when all tasks have settled.
 *
 * Semantics: results are returned in input order (same as Promise.all),
 * but only `limit` tasks are awaited concurrently. If any task rejects,
 * the rejection propagates immediately (consistent with Promise.all).
 */
async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      results[index] = await tasks[index]();
    }
  }

  // Spawn `limit` workers (or fewer if there are fewer tasks)
  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum parallel file extractions. Keeps libuv threadpool headroom. */
const MAX_CONCURRENCY = 8;

// ---------------------------------------------------------------------------
// ZipExtractorServiceImpl
// ---------------------------------------------------------------------------

export class ZipExtractorServiceImpl implements ZipExtractorService {
  /**
   * @param onProgress Optional callback for per-file extraction progress.
   *   The caller (ImportServiceImpl) passes its own onProgress so that
   *   granular file-count detail reaches the renderer without a separate IPC
   *   channel — the public ZipExtractorService interface stays unchanged.
   */
  async extract(
    zipFilePath: string,
    onProgress?: (step: ImportStep, label: string, progress: number, detail?: string) => void
  ): Promise<string> {
    try {
      const paths = getAppPaths();
      const tempDir = path.join(paths.data, 'temp', uuidv4());
      await fs.mkdir(tempDir, { recursive: true });

      log.info(`Reading ZIP file: ${zipFilePath}`);
      const data = await fs.readFile(zipFilePath);
      const zip = await JSZip.loadAsync(data);

      // Collect all non-directory entries up-front so we know the total count
      // and can validate zip-slip before any I/O begins.
      const entries: Array<{ relativePath: string; file: JSZip.JSZipObject }> = [];

      zip.forEach((relativePath, file) => {
        if (file.dir) return; // Skip directories

        // Security: Prevent zip slip — reject the whole archive if any entry
        // contains a path traversal sequence.
        if (relativePath.includes('..')) {
          throw new Error('Zip slip vulnerability detected in package.');
        }

        entries.push({ relativePath, file });
      });

      const total = entries.length;
      let completed = 0;

      log.info(`Extracting ${total} files from ZIP with concurrency=${MAX_CONCURRENCY}`);

      // Build task factories so the concurrency limiter can schedule them
      const tasks = entries.map(({ relativePath, file }) => async () => {
        const outPath = path.join(tempDir, relativePath);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        const buffer = await file.async('nodebuffer');
        await fs.writeFile(outPath, buffer);

        // Atomic increment — workers are sequential within a single JS thread
        // (the await above yields, but JS is still single-threaded, so this
        //  read-modify-write is safe without a mutex)
        completed++;
        onProgress?.(
          'extracting',
          'Extracting package...',
          // Keep the overall progress in the range [10, 19] — the import
          // pipeline owns the coarse steps; we only refine within this step.
          10,
          `Extracting files (${completed}/${total})`
        );
      });

      await runWithConcurrency(tasks, MAX_CONCURRENCY);

      log.info(`Extracted ${total} files to ${tempDir}`);
      return tempDir;
    } catch (error) {
      log.error('Extraction failed', error);
      throw new Error(
        `Failed to extract ZIP package: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async cleanup(tempDirPath: string): Promise<void> {
    try {
      log.info(`Cleaning up temp directory: ${tempDirPath}`);
      await fs.rm(tempDirPath, { recursive: true, force: true });
    } catch (error) {
      log.error(`Failed to cleanup temp directory ${tempDirPath}`, error);
    }
  }
}
