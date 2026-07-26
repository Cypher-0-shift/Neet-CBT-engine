import { ipcMain } from 'electron';
import { IpcChannel } from '../../shared/types/ipc.types';
import { logger } from '../logger';
import { getDatabase } from '../database/connection';
import { EventRepositoryImpl } from '../database/repositories/event.repository.impl';
import type { EventBatch, ExamEvent } from '../../shared/types/event.types';
import { v4 as uuidv4 } from 'uuid';

const log = logger.module('IPC:Events');

export function registerEventHandlers(): void {
  const db = getDatabase();
  const eventRepo = new EventRepositoryImpl(db);

  ipcMain.handle(IpcChannel.FLUSH_EVENTS, async (_event, args: EventBatch) => {
    try {
      if (!args.events || args.events.length === 0) {
        return true;
      }

      const examEvents: ExamEvent[] = args.events.map((e, index) => ({
        id: uuidv4(),
        sessionId: args.sessionId,
        questionId: e.questionId || null,
        // fallback to type if eventType is missing (because of useExamEvents format)
        eventType: e.eventType || (e as any).type || 'UNKNOWN',
        eventData: e.eventData || Object.keys(e).reduce((acc: any, key) => {
          if (key !== 'eventType' && key !== 'type' && key !== 'timestamp' && key !== 'questionId' && key !== 'sessionId') {
            acc[key] = (e as any)[key];
          }
          return acc;
        }, {}),
        timestamp: e.timestamp || new Date().toISOString(),
        sequenceNumber: index
      }));

      await eventRepo.saveEvents(examEvents);
      return true;
    } catch (err) {
      log.error('Failed to flush events', err);
      return false;
    }
  });

  log.info('Event handlers registered');
}
