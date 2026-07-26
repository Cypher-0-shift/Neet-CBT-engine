import { ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { IpcChannel } from '../../shared/types/ipc.types';
import { logger } from '../logger';
import { getDatabase } from '../database/connection';
import { SessionRepositoryImpl } from '../database/repositories/session.repository.impl';
import { TestRepositoryImpl } from '../database/repositories/test.repository.impl';
import { SettingsRepositoryImpl } from '../database/repositories/settings.repository.impl';
import { SettingsServiceImpl } from '../services/settings.service.impl';
import type { Session, SessionStatus } from '../../shared/types/session.types';

const log = logger.module('SessionIpc');

const submittingSessions = new Set<string>();

export function registerSessionHandlers(): void {
  const db = getDatabase();
  const sessionRepo = new SessionRepositoryImpl(db);

  // Abandon any incomplete sessions on startup so we start fresh
  sessionRepo.abandonIncompleteSessions().catch(err => log.error('Failed to abandon incomplete sessions', err));

  ipcMain.handle(IpcChannel.CREATE_SESSION, async (_event, args) => {
    log.debug('CREATE_SESSION called');
    const { testId, candidate } = args;

    // Fetch test duration from DB
    const testRepo = new TestRepositoryImpl(db);
    const testSummary = await testRepo.getTestById(testId).catch(() => null);
    const testDurationSeconds = testSummary ? testSummary.durationMinutes * 60 : 10800;

    // Check settings for custom time limit override
    const settingsRepo = new SettingsRepositoryImpl(db);
    const settingsService = new SettingsServiceImpl(settingsRepo);
    const settings = await settingsService.getSettings().catch(() => null);

    const mode = 'Exam';

    let durationSeconds = testDurationSeconds;
    if (settings) {
      const customMinutes = settings.examTimeLimitMinutes;
      if (customMinutes > 0) {
        durationSeconds = customMinutes * 60;
        log.info(`Custom time limit applied: ${customMinutes} min for ${mode} mode`);
      }
    }

    const session: Session = {
      id: uuidv4(),
      testId,
      candidateName: candidate.name,
      registrationNumber: candidate.registrationNumber,
      mode: mode as any,
      language: candidate.language || 'English',
      startTime: new Date().toISOString(),
      endTime: null,
      durationSeconds,
      timeRemainingSeconds: durationSeconds,
      status: 'IN_PROGRESS' as SessionStatus,
      totalScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalSkipped: 0,
      totalMarkedReview: 0,
      testVersionHash: null,
      isSubmitted: false,
      createdAt: new Date().toISOString(),
    };

    await sessionRepo.createSession(session);
    return session;
  });

  ipcMain.handle(IpcChannel.GET_SESSION, async (_event, args) => {
    return await sessionRepo.getSessionById(args.sessionId);
  });

  ipcMain.handle(IpcChannel.UPDATE_SESSION, async (_event, args) => {
    return await sessionRepo.updateSession(args.sessionId, args.updates);
  });

  ipcMain.handle(IpcChannel.SAVE_ANSWER, async (_event, args) => {
    await sessionRepo.saveAnswer(args.answer);
  });

  ipcMain.handle(IpcChannel.SUBMIT_SESSION, async (_event, args) => {
    if (submittingSessions.has(args.sessionId)) {
      log.warn(`Submission already in progress for session: ${args.sessionId}`);
      return;
    }
    submittingSessions.add(args.sessionId);
    try {
      await sessionRepo.submitSession(args.sessionId);
    } finally {
      submittingSessions.delete(args.sessionId);
    }
  });

  ipcMain.handle(IpcChannel.SAVE_CHECKPOINT, async (_event, args) => {
    await sessionRepo.saveCheckpoint(args.checkpoint);
  });

  ipcMain.handle(IpcChannel.LOAD_CHECKPOINT, async (_event, args) => {
    return await sessionRepo.getCheckpoint(args.sessionId);
  });

  ipcMain.handle(IpcChannel.GET_INCOMPLETE_SESSIONS, async () => {
    return await sessionRepo.getIncompleteSessions();
  });

  log.info('Session handlers registered');
}
