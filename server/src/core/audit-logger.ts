// Minimal Audit Logger
// Simple governance logging without external dependencies

export interface AuditEvent {
  timestamp: string;
  contract: string;
  gate: 'SAFE' | 'ARMED';
  success: boolean;
  duration_ms?: number;
  error?: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];

  log(event: AuditEvent): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    });
  }

  getEvents(): AuditEvent[] {
    return this.events;
  }

  query(filter: Partial<AuditEvent>): AuditEvent[] {
    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key as keyof AuditEvent] === value;
      });
    });
  }

  clear(): void {
    this.events = [];
  }
}
