import type { ImageLoaderService } from './image-loader.service';
import type { ImportStep } from '../../shared/types/test.types';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';

const log = logger.module('ImageLoader');

// ---------------------------------------------------------------------------
// Concurrency limiter (same pattern as zip-extractor, defined independently
// so each module compiles without cross-service coupling)
// ---------------------------------------------------------------------------

/**
 * Runs an array of async task factories with at most `limit` tasks in flight
 * at any given time, resolving when all tasks have settled.
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

/** Maximum parallel file copies. Keeps libuv threadpool headroom. */
const MAX_CONCURRENCY = 8;

/** Allowed image extensions — same set as before. */
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

// ---------------------------------------------------------------------------
// ImageLoaderServiceImpl
// ---------------------------------------------------------------------------

export class ImageLoaderServiceImpl implements ImageLoaderService {
  /**
   * @param onProgress Optional callback for per-file copy progress.
   *   Passed in by ImportServiceImpl so the renderer sees granular counts
   *   without adding a separate IPC channel. The public ImageLoaderService
   *   interface stays unchanged.
   */
  async processTestImages(
    sourceDir: string,
    testId: string,
    onProgress?: (step: ImportStep, label: string, progress: number, detail?: string) => void
  ): Promise<void> {
    const sourceImagesDir = path.join(sourceDir, 'images');
    const destImagesDir = path.join(getAppPaths().images, testId);

    try {
      // Check if source images directory exists
      try {
        await fs.access(sourceImagesDir);
      } catch {
        log.info('No images directory found in package, skipping image processing.');
        return;
      }

      // Create destination directory
      await fs.mkdir(destImagesDir, { recursive: true });

      // Read all files in source images dir
      const allFiles = await fs.readdir(sourceImagesDir);
      log.info(`Found ${allFiles.length} files in images directory for test ${testId}`);

      // Filter to allowed image types (same logic as before; skipped files are
      // logged but do not contribute to the progress count)
      const imageFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          log.warn(`Skipping unknown file type in images directory: ${file}`);
          return false;
        }
        return true;
      });

      const total = imageFiles.length;
      let completed = 0;

      log.info(`Copying ${total} images for test ${testId} with concurrency=${MAX_CONCURRENCY}`);

      // Build task factories for the concurrency limiter
      const tasks = imageFiles.map(file => async () => {
        const srcPath = path.join(sourceImagesDir, file);
        const destPath = path.join(destImagesDir, file);
        await fs.copyFile(srcPath, destPath);

        completed++;
        onProgress?.(
          'loading_images',
          'Copying images...',
          // Keep the overall progress within the range [60, 79] — the import
          // pipeline maps this step to that window.
          60 + Math.floor((completed / total) * 19),
          `Copying images (${completed}/${total})`
        );
      });

      await runWithConcurrency(tasks, MAX_CONCURRENCY);

      log.info(`Successfully copied ${total} images for test ${testId}`);
    } catch (error) {
      log.error('Failed to process test images', error);
      throw new Error('Image Processing Error');
    }
  }

  async deleteTestImages(testId: string): Promise<void> {
    const destImagesDir = path.join(getAppPaths().images, testId);
    try {
      log.info(`Deleting images for test ${testId}`);
      await fs.rm(destImagesDir, { recursive: true, force: true });
    } catch (error) {
      log.warn(`Failed to delete images for test ${testId}, may not exist.`, error);
    }
  }
}
