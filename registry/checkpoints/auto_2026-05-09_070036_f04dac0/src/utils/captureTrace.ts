// src/utils/captureTrace.ts
// Lightweight trace capture for 4D Spatio-Temporal Repair Loop

export interface ExecutionTrace {
  timestamp: number;
  phase: string;
}

export class TraceCapture {
  private traces: ExecutionTrace[] = [];
  private startTime: number = Date.now() / 1000; // Simulated os.clock() in TS

  constructor() {
    this.reset();
  }

  reset() {
    this.traces = [];
    this.startTime = Date.now() / 1000;
  }

  // Call this at key lifecycle points in your scripts
  record(phase: string) {
    const now = Date.now() / 1000;
    this.traces.push({
      timestamp: now - this.startTime,   // relative time from script start
      phase
    });
    return now;
  }

  // Get the trace for embedding
  getTrace(): ExecutionTrace[] {
    return [...this.traces];
  }

  // Print trace for debugging
  print() {
    console.log("=== Execution Trace ===");
    this.traces.forEach(t => {
      console.log(`t=${t.timestamp.toFixed(3)}s → ${t.phase}`);
    });
  }
}

// Global singleton (easy to use across scripts)
export const traceCapture = new TraceCapture();
