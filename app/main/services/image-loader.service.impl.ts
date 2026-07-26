import type { ImageLoaderService } from './image-loader.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';

const log = logger.module('ImageLoader');

export class ImageLoaderServiceImpl implements ImageLoaderService {
  async processTestImages(sourceDir: string, testId: string): Promise<void> {
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
      const files = await fs.readdir(sourceImagesDir);
      log.info(`Found ${files.length} images to process for test ${testId}`);

      const copyPromises = files.map(async file => {
        const ext = path.extname(file).toLowerCase();
        // Basic extension validation
        if (!['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
          log.warn(`Skipping unknown file type in images directory: ${file}`);
          return;
        }

        const srcPath = path.join(sourceImagesDir, file);
        const destPath = path.join(destImagesDir, file);
        
        await fs.copyFile(srcPath, destPath);
      });

      await Promise.all(copyPromises);
      log.info(`Successfully copied images for test ${testId}`);
      
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
