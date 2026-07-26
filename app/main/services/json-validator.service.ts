/**
 * JsonValidatorService interface
 * Validates JSON against defined schemas
 */

export interface JsonValidatorService {
  /**
   * Validates metadata.json
   * @param jsonContent Parsed JSON object
   */
  validateMetadata(jsonContent: any): Promise<boolean>;

  /**
   * Validates questions.json
   * @param jsonContent Parsed JSON array
   */
  validateQuestions(jsonContent: any[]): Promise<boolean>;

  /**
   * Validates answer_key.json
   * @param jsonContent Parsed JSON object
   */
  validateAnswerKey(jsonContent: any): Promise<boolean>;
}
