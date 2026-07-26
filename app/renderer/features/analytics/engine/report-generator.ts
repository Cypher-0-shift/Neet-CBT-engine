/**
 * ReportGenerator interface
 * Formats and generates structured output reports (e.g. PDF/JSON)
 */

import type { AnalyticsReport } from '@shared/types/analytics.types';

export interface ReportGenerator {
  /**
   * Generates a printable/exportable report representation
   * @param report The computed analytics report
   * @param format The desired export format (e.g. 'json', 'pdf')
   */
  generateExport(report: AnalyticsReport, format: 'json' | 'pdf'): Promise<Blob | string>;

  /**
   * Generates AI/Rule-based text recommendations based on the report
   * @param report The computed analytics report
   */
  generateRecommendations(report: AnalyticsReport): string[];
}
