import { ipcMain } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import { getDatabase } from '../database/connection';
import { logger } from '../logger';
import { IntelligenceRepositoryImpl } from '../database/repositories/intelligence.repository.impl';
import type { IpcRequest } from '../../shared/types/ipc.types';

const log = logger.module('IPC:Intelligence');

export function registerIntelligenceHandlers() {
  const db = getDatabase();
  const repo = new IntelligenceRepositoryImpl(db);

  // Toggle Bookmark
  ipcMain.handle(IpcChannel.TOGGLE_BOOKMARK, async (_, req: IpcRequest<typeof IpcChannel.TOGGLE_BOOKMARK>) => {
    log.debug(`Toggling bookmark for question: ${req.questionId}`);
    try {
      const isBookmarked = repo.toggleBookmark(req.questionId);
      return { isBookmarked };
    } catch (error) {
      log.error('Failed to toggle bookmark:', error);
      throw error;
    }
  });

  // Get Bookmarks
  ipcMain.handle(IpcChannel.GET_BOOKMARKS, async () => {
    log.debug('Fetching bookmarks');
    try {
      return repo.getBookmarks();
    } catch (error) {
      log.error('Failed to get bookmarks:', error);
      throw error;
    }
  });

  // Save Note
  ipcMain.handle(IpcChannel.SAVE_NOTE, async (_, req: IpcRequest<typeof IpcChannel.SAVE_NOTE>) => {
    log.debug(`Saving note for question: ${req.questionId}`);
    try {
      return repo.saveNote(req.questionId, req.content);
    } catch (error) {
      log.error('Failed to save note:', error);
      throw error;
    }
  });

  // Get Note
  ipcMain.handle(IpcChannel.GET_NOTE, async (_, req: IpcRequest<typeof IpcChannel.GET_NOTE>) => {
    log.debug(`Fetching note for question: ${req.questionId}`);
    try {
      return repo.getNote(req.questionId);
    } catch (error) {
      log.error('Failed to get note:', error);
      throw error;
    }
  });

  // Get Wrong Questions
  ipcMain.handle(IpcChannel.GET_WRONG_QUESTIONS, async (_, req: IpcRequest<typeof IpcChannel.GET_WRONG_QUESTIONS>) => {
    log.debug(`Fetching wrong questions (limit: ${req.limit}, offset: ${req.offset})`);
    try {
      return repo.getWrongQuestions(req.limit, req.offset, req.subject);
    } catch (error) {
      log.error('Failed to get wrong questions:', error);
      throw error;
    }
  });

  // Get Study Insights
  ipcMain.handle(IpcChannel.GET_STUDY_INSIGHTS, async () => {
    log.debug('Fetching study insights');
    try {
      return repo.getStudyInsights();
    } catch (error) {
      log.error('Failed to get study insights:', error);
      throw error;
    }
  });
}
