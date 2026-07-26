import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { getDatabase, closeDatabase, initializeDatabase } from '../database/connection';
import { getAppPaths } from '../config/paths.config';
import { logger } from '../logger';
import { BackupService } from './backup.service';

const log = logger.module('BackupService');

export class BackupServiceImpl implements BackupService {
  /**
   * Creates a backup archive containing the database and all images.
   * Uses better-sqlite3's online backup API for safe DB snapshot.
   */
  public async createBackup(destinationDir: string): Promise<string> {
    const paths = getAppPaths();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalDest = path.join(destinationDir, `neet-backup-${timestamp}.neetbackup`);
    
    log.info(`Creating backup at ${finalDest}`);

    const db = getDatabase();
    const tempDbBackupPath = path.join(paths.temp, `db-backup-${timestamp}.sqlite`);

    try {
      // 1. Online backup of SQLite database (safe while app is running)
      log.info('Running SQLite online backup...');
      await db.backup(tempDbBackupPath);

      // 2. Zip everything
      log.info('Zipping database and images...');
      const zip = new JSZip();
      
      // Add DB
      const dbData = await fs.promises.readFile(tempDbBackupPath);
      zip.file('database.sqlite', dbData);

      // Add Images
      const addFolderToZip = async (folderPath: string, zipFolder: JSZip) => {
        if (!fs.existsSync(folderPath)) return;
        const items = await fs.promises.readdir(folderPath);
        for (const item of items) {
          const itemPath = path.join(folderPath, item);
          const stat = await fs.promises.stat(itemPath);
          if (stat.isDirectory()) {
            await addFolderToZip(itemPath, zipFolder.folder(item)!);
          } else {
            const data = await fs.promises.readFile(itemPath);
            zipFolder.file(item, data);
          }
        }
      };

      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        await addFolderToZip(paths.images, imagesFolder);
      }

      // 3. Write zip to disk
      log.info('Writing backup archive...');
      const content = await zip.generateAsync({ 
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      await fs.promises.writeFile(finalDest, content);

      log.info('Backup completed successfully.');
      return finalDest;
    } catch (error) {
      log.error('Backup failed:', error);
      throw error;
    } finally {
      // Cleanup temp db
      if (fs.existsSync(tempDbBackupPath)) {
        await fs.promises.unlink(tempDbBackupPath).catch(e => log.error('Failed to cleanup temp backup', e));
      }
    }
  }

  /**
   * Restores the application state from a .neetbackup archive.
   * REQUIRES app restart afterwards (or graceful re-initialization).
   */
  public async restoreBackup(sourcePath: string): Promise<void> {
    const paths = getAppPaths();
    log.info(`Restoring backup from ${sourcePath}`);

    try {
      const data = await fs.promises.readFile(sourcePath);
      const zip = await JSZip.loadAsync(data);

      // 1. Close current database
      log.info('Closing active database for restore...');
      closeDatabase();

      // 2. Extract Database
      const dbFile = zip.file('database.sqlite');
      if (!dbFile) {
        throw new Error('Invalid backup file: Missing database.sqlite');
      }
      const dbContent = await dbFile.async('nodebuffer');
      
      // Backup current DB just in case
      const currentDbPath = paths.database;
      if (fs.existsSync(currentDbPath)) {
        fs.renameSync(currentDbPath, currentDbPath + '.old');
      }

      await fs.promises.writeFile(currentDbPath, dbContent);

      // 3. Extract Images
      log.info('Restoring images...');
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        // Clear current images
        if (fs.existsSync(paths.images)) {
          fs.rmSync(paths.images, { recursive: true, force: true });
        }
        fs.mkdirSync(paths.images, { recursive: true });

        // Extract new images
        for (const [relativePath, file] of Object.entries(imagesFolder.files)) {
          if (!file.dir) {
            const destPath = path.join(paths.images, relativePath);
            const dir = path.dirname(destPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            const content = await file.async('nodebuffer');
            await fs.promises.writeFile(destPath, content);
          }
        }
      }

      log.info('Restore completed successfully. Reinitializing database...');
      initializeDatabase();

    } catch (error) {
      log.error('Restore failed:', error);
      // Attempt recovery
      if (fs.existsSync(paths.database + '.old')) {
        log.info('Attempting to rollback database to previous state...');
        if (fs.existsSync(paths.database)) fs.unlinkSync(paths.database);
        fs.renameSync(paths.database + '.old', paths.database);
        initializeDatabase();
      }
      throw error;
    }
  }
}
