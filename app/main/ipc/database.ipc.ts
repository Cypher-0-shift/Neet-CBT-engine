import { ipcMain } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import { logger } from '../logger';
import { getDatabase } from '../database/connection';
import { TestRepositoryImpl } from '../database/repositories/test.repository.impl';
import { QuestionRepositoryImpl } from '../database/repositories/question.repository.impl';
import { SessionRepositoryImpl } from '../database/repositories/session.repository.impl';

const log = logger.module('IPC:Database');

export function registerDatabaseHandlers(): void {
  ipcMain.handle(IpcChannel.GET_ALL_TESTS, async () => {
    log.debug('GET_ALL_TESTS called');
    const db = getDatabase();
    const repo = new TestRepositoryImpl(db);
    return repo.getAllTests();
  });

  ipcMain.handle(IpcChannel.GET_TEST_BY_ID, async (_event, args) => {
    log.debug(`GET_TEST_BY_ID called: ${args?.testId}`);
    const db = getDatabase();
    const repo = new TestRepositoryImpl(db);
    return repo.getTestById(args?.testId);
  });

  ipcMain.handle(IpcChannel.GET_TEST_SUMMARY, async (_event, args) => {
    log.debug(`GET_TEST_SUMMARY called: ${args?.testId}`);
    const db = getDatabase();
    const repo = new TestRepositoryImpl(db);
    const tests = await repo.getAllTests();
    const test = tests.find(t => t.id === args?.testId);
    return test || null;
  });

  ipcMain.handle(IpcChannel.DELETE_TEST, async (_event, args) => {
    log.debug(`DELETE_TEST called: ${args?.testId}`);
    const db = getDatabase();
    const repo = new TestRepositoryImpl(db);
    return repo.deleteTest(args?.testId);
  });

  ipcMain.handle(IpcChannel.GET_TEST_QUESTIONS, async (_event, args) => {
    log.debug(`GET_TEST_QUESTIONS called: ${args?.testId}`);
    const db = getDatabase();
    const repo = new QuestionRepositoryImpl(db);
    return repo.getQuestionsByTestId(args?.testId);
  });

  ipcMain.handle(IpcChannel.GET_HISTORY, async () => {
    log.debug('GET_HISTORY called');
    const db = getDatabase();
    const repo = new SessionRepositoryImpl(db);
    return repo.getSessionHistory();
  });

  log.info('Database handlers registered');
}
