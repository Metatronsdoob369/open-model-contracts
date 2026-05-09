import crypto from "node:crypto";

const BITS_64 = 64n;
const TOTAL_BITS = 128;

export interface DriftResult {
  stable: boolean;
  hammingDistance: number;
  hammingRatio: number;
  threshold: number;
}

export class SimHashDriftGuard {
  constructor(private readonly threshold: number) {
    if (threshold < 0 || threshold > 1) {
      throw new Error(`Threshold must be 0.0-1.0, got ${threshold}`);
    }
  }

  evaluateDrift(sigA: bigint, sigB: bigint): DriftResult {
    const xor = sigA ^ sigB;
    const hammingDistance = this.popcount(xor);
    const hammingRatio = hammingDistance / TOTAL_BITS;

    return {
      stable: hammingRatio <= this.threshold,
      hammingDistance,
      hammingRatio,
      threshold: this.threshold
    };
  }

  simHash128FromText(text: string, schema: string): bigint {
    const schemaSlice = schema.slice(0, 6);
    const saltA = Buffer.from(`RFG:shA:${schemaSlice}`);
    const saltB = Buffer.from(`RFG:shB:${schemaSlice}`);

    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const tokens = new Uint32Array(words.length);
    for (let i = 0; i < words.length; i++) tokens[i] = this.fnv1a32(words[i]);

    const sigA = this.simHash64(tokens, saltA);
    const sigB = this.simHash64(tokens, saltB);

    return (sigA << BITS_64) | sigB;
  }

  private simHash64(tokens: Uint32Array, personSalt: Buffer): bigint {
    const acc = new Int32Array(64);

    for (let i = 0; i < tokens.length; i++) {
      const tokenHash = this.hashToken(tokens[i], personSalt);
      for (let bit = 0n; bit < BITS_64; bit++) {
        acc[Number(bit)] += ((tokenHash >> bit) & 1n) === 1n ? 1 : -1;
      }
    }

    let sig = 0n;
    for (let bit = 0n; bit < BITS_64; bit++) {
      if (acc[Number(bit)] > 0) sig |= (1n << bit);
    }
    return sig;
  }

  private hashToken(token: number, personSalt: Buffer): bigint {
    const tokenBuf = Buffer.alloc(4);
    tokenBuf.writeUInt32BE(token, 0);
    const data = Buffer.concat([personSalt, tokenBuf]);
    const hash = crypto.createHash("blake2b512").update(data).digest();
    return hash.readBigUInt64BE(0);
  }

  private fnv1a32(str: string): number {
    let hash = 0x811c9dc5;
    for (let index = 0; index < str.length; index++) {
      hash ^= str.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  private popcount(value: bigint): number {
    let count = 0;
    let cursor = value < 0n ? -value : value;
    while (cursor > 0n) {
      count += Number(cursor & 1n);
      cursor >>= 1n;
    }
    return count;
  }
}
