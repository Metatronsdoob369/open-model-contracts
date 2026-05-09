/**
 * Sequencer Agent: Execution Queue
 */

export const sequencerQueue = {
  enqueue: (task: any) => {
    console.log(`📡 [SEQUENCER] Enqueued task: ${task.action} [Bridge: ${task.bridge.id}]`);
  }
};
