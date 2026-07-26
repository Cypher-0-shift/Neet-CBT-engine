/**
 * ZipExtractorService interface
 * Extracts ZIP and validates base structure
 */

export interface ZipExtractorService {
  /**
   * Extracts a ZIP file to a temporary directory
   * @param zipFilePath Path to the .zip file
   * @returns Path to the extracted temporary directory
   */
  extract(zipFilePath: string): Promise<string>;

  /**
   * Cleans up the temporary directory
   * @param tempDirPath Path to the temporary directory
   */
  cleanup(tempDirPath: string): Promise<void>;
}
