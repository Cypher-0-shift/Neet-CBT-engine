import type { ZipExtractorService } from './zip-extractor.service';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';

const log = logger.module('ZipExtractor');

export class ZipExtractorServiceImpl implements ZipExtractorService {
  async extract(zipFilePath: string): Promise<string> {
    try {
      const paths = getAppPaths();
      const tempDir = path.join(paths.data, 'temp', uuidv4());
      await fs.mkdir(tempDir, { recursive: true });

      log.info(`Reading ZIP file: ${zipFilePath}`);
      const data = await fs.readFile(zipFilePath);
      const zip = await JSZip.loadAsync(data);

      const extractPromises: Promise<void>[] = [];

      zip.forEach((relativePath, file) => {
        if (file.dir) return; // Skip directories
        
        // Security: Prevent zip slip
        if (relativePath.includes('..')) {
          throw new Error('Zip slip vulnerability detected in package.');
        }

        const outPath = path.join(tempDir, relativePath);
        
        extractPromises.push(
          fs.mkdir(path.dirname(outPath), { recursive: true }).then(() => {
            return file.async('nodebuffer').then(buffer => fs.writeFile(outPath, buffer));
          })
        );
      });

      await Promise.all(extractPromises);
      log.info(`Extracted package to ${tempDir}`);
      
      return tempDir;
    } catch (error) {
      log.error('Extraction failed', error);
      throw new Error(`Failed to extract ZIP package: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
