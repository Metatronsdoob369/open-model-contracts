export interface CachedShard {
  id: string;
  source: string;
  content: string;
}

interface CacheEntry {
  shard: CachedShard;
  frequency: number;
  lastAccessed: number;
}

export class ShardCache {
  private readonly map = new Map<string, CacheEntry>();
  private counter = 0;

  constructor(private readonly maxSize = 500) {
    if (maxSize < 1) throw new Error("Cache maxSize must be >= 1");
  }

  get(id: string): CachedShard | undefined {
    const entry = this.map.get(id);
    if (!entry) return undefined;
    entry.frequency += 1;
    entry.lastAccessed = ++this.counter;
    return entry.shard;
  }

  put(shard: CachedShard): void {
    const existing = this.map.get(shard.id);
    if (existing) {
      existing.shard = shard;
      existing.frequency += 1;
      existing.lastAccessed = ++this.counter;
      return;
    }

    if (this.map.size >= this.maxSize) this.evict();
    this.map.set(shard.id, {
      shard,
      frequency: 1,
      lastAccessed: ++this.counter
    });
  }

  get size(): number {
    return this.map.size;
  }

  private evict(): void {
    let victimId: string | null = null;
    let victimFreq = Infinity;
    let victimAccess = Infinity;

    for (const [id, entry] of this.map.entries()) {
      if (
        entry.frequency < victimFreq ||
        (entry.frequency === victimFreq && entry.lastAccessed < victimAccess)
      ) {
        victimId = id;
        victimFreq = entry.frequency;
        victimAccess = entry.lastAccessed;
      }
    }

    if (victimId) this.map.delete(victimId);
  }
}
