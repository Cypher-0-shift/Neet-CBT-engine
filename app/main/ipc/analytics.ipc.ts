import { ipcMain } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import { getDatabase } from '../database/connection';
import { logger } from '../logger';
import { AnalyticsRepositoryImpl } from '../database/repositories/analytics.repository.impl';
import { SessionRepositoryImpl } from '../database/repositories/session.repository.impl';
import { QuestionRepositoryImpl } from '../database/repositories/question.repository.impl';
import { EventRepositoryImpl } from '../database/repositories/event.repository.impl';
import { AnalyticsEngine } from '../analytics/engine/AnalyticsEngine';
import type { IpcRequest } from '../../shared/types/ipc.types';
import { dialog } from 'electron';
import * as fs from 'fs';

const log = logger.module('IPC:Analytics');

export function registerAnalyticsHandlers() {
  const db = getDatabase();
  const analyticsRepo = new AnalyticsRepositoryImpl(db);
  const sessionRepo = new SessionRepositoryImpl(db);
  const questionRepo = new QuestionRepositoryImpl(db);
  const eventRepo = new EventRepositoryImpl(db);
  const engine = new AnalyticsEngine();

  // Generate Analytics
  ipcMain.handle(IpcChannel.GENERATE_ANALYTICS, async (_, req: IpcRequest<typeof IpcChannel.GENERATE_ANALYTICS>) => {
    log.info(`Generating analytics for session: ${req.sessionId}`);
    try {
      // 1. Fetch all raw data
      const session = await sessionRepo.getSessionById(req.sessionId);
      if (!session) throw new Error('Session not found');

      const answers = await sessionRepo.getAnswersBySessionId(req.sessionId);
      const events = await eventRepo.getEventsBySessionId(req.sessionId);
      const questions = await questionRepo.getQuestionsByTestId(session.testId);

      // 2. Generate report
      const report = engine.generateReport(session, answers, events, questions);

      // 3. Persist report
      await analyticsRepo.saveReport(report);

      // 4. Update session table with calculated scores
      await sessionRepo.updateSession(session.id, {
        totalScore: report.overall?.totalScore ?? 0,
        totalCorrect: report.overall?.totalCorrect ?? 0,
        totalIncorrect: report.overall?.totalIncorrect ?? 0,
      });

      log.info(`Analytics generated successfully for session: ${req.sessionId}`);
      return report;
    } catch (error) {
      log.error('Failed to generate analytics:', error);
      throw error;
    }
  });

  // Get Analytics Report (already generated)
  ipcMain.handle(IpcChannel.GET_ANALYTICS_REPORT, async (_, req: IpcRequest<typeof IpcChannel.GET_ANALYTICS_REPORT>) => {
    log.debug(`Fetching analytics for session: ${req.sessionId}`);
    try {
      return await analyticsRepo.getReportBySessionId(req.sessionId);
    } catch (error) {
      log.error('Failed to fetch analytics:', error);
      throw error;
    }
  });

  // Get Progress Data
  ipcMain.handle(IpcChannel.GET_PROGRESS_DATA, async () => {
    // Basic implementation for now
    return [];
  });

  // Export JSON
  ipcMain.handle(IpcChannel.EXPORT_ANALYTICS_JSON, async (_, req: IpcRequest<typeof IpcChannel.EXPORT_ANALYTICS_JSON>) => {
    try {
      const report = await analyticsRepo.getReportBySessionId(req.sessionId);
      if (!report) throw new Error('Report not found');

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Analytics JSON',
        defaultPath: `analytics_${req.sessionId}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (canceled || !filePath) return { success: false, error: 'Cancelled by user' };

      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (error: any) {
      log.error('Failed to export JSON:', error);
      return { success: false, error: error.message };
    }
  });

  // Print PDF
  ipcMain.handle(IpcChannel.PRINT_ANALYTICS_PDF, async (event) => {
    try {
      const webContents = event.sender;
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export Analytics PDF',
        defaultPath: `analytics_report.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, error: 'Cancelled by user' };

      const pdfData = await webContents.printToPDF({
        printBackground: true,
        margins: { marginType: 'default' },
        landscape: true, // often better for dashboards
      });

      fs.writeFileSync(filePath, pdfData);
      return { success: true, filePath };
    } catch (error: any) {
      log.error('Failed to print PDF:', error);
      return { success: false, error: error.message };
    }
  });
}
