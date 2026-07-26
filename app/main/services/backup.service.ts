/**
 * BackupService interface
 * Handles database backup and restore
 */

export interface BackupService {
  /**
   * Creates a backup of the current SQLite database
   * @param destinationDir Directory to save the backup
   * @returns Path to the created backup file
   */
  createBackup(destinationDir: string): Promise<string>;

  /**
   * Restores the database from a backup file
   * @param backupFilePath Path to the backup file
   */
  restoreBackup(backupFilePath: string): Promise<void>;
}
