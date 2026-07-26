/**
 * ImageLoaderService interface
 * Copies images to app data and manages them
 */

export interface ImageLoaderService {
  /**
   * Processes all images in the extracted test package
   * @param sourceDir Path to the extracted package directory
   * @param testId The UUID of the test being imported
   * @returns Resolves when images are successfully copied
   */
  processTestImages(sourceDir: string, testId: string): Promise<void>;

  /**
   * Deletes all images associated with a test
   * @param testId The UUID of the test
   */
  deleteTestImages(testId: string): Promise<void>;
}
