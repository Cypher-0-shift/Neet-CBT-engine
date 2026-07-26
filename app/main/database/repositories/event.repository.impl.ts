import type { Database } from 'better-sqlite3';
import type { EventRepository } from './event.repository';
import type { ExamEvent } from '../../../shared/types/event.types';
import { v4 as uuidv4 } from 'uuid';

export class EventRepositoryImpl implements EventRepository {
  constructor(private db: Database) {}

  async saveEvents(events: ExamEvent[]): Promise<void> {
    if (!events.length) return;

    const stmt = this.db.prepare(`
      INSERT INTO events (id, session_id, question_id, event_type, event_data_json, timestamp, sequence_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEvents = this.db.transaction((eventsList: ExamEvent[]) => {
      for (let i = 0; i < eventsList.length; i++) {
        const e = eventsList[i];
        stmt.run(
          e.id || uuidv4(),
          e.sessionId,
          e.questionId || null,
          e.eventType,
          e.eventData ? JSON.stringify(e.eventData) : null,
          e.timestamp,
          e.sequenceNumber || i
        );
      }
    });

    insertEvents(events);
  }

  async getEventsBySessionId(sessionId: string): Promise<ExamEvent[]> {
    const rows = this.db.prepare(`
      SELECT * FROM events 
      WHERE session_id = ? 
      ORDER BY timestamp ASC, sequence_number ASC
    `).all(sessionId) as any[];

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      questionId: row.question_id,
      eventType: row.event_type,
      eventData: row.event_data_json ? JSON.parse(row.event_data_json) : undefined,
      timestamp: row.timestamp,
      sequenceNumber: row.sequence_number
    }));
  }

  async getEventsByType(sessionId: string, eventType: string): Promise<ExamEvent[]> {
    const rows = this.db.prepare(`
      SELECT * FROM events 
      WHERE session_id = ? AND event_type = ?
      ORDER BY timestamp ASC
    `).all(sessionId, eventType) as any[];

    return rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      questionId: row.question_id,
      eventType: row.event_type,
      eventData: row.event_data_json ? JSON.parse(row.event_data_json) : undefined,
      timestamp: row.timestamp,
      sequenceNumber: row.sequence_number
    }));
  }
}
