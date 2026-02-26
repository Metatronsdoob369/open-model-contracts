// src/orchestration/domain-detector.ts
export type DomainResult = {
  domain: string;
  confidence: number;
  explanation?: string;
};

export class DomainDetector {
  private keywordMap: Record<string, string[]> = {
    'general': ['data', 'system', 'process', 'workflow'],
    'technical': ['api', 'database', 'server', 'code'],
    'business': ['revenue', 'customer', 'sales', 'market']
  };

  constructor(private llmClient: { classify?: (text: string)=>Promise<DomainResult> }|null = null) {}

  async classify(text: string): Promise<DomainResult> {
    const t = (text || '').toLowerCase();
    const scores: Record<string, number> = {};
    
    for (const [domain, kws] of Object.entries(this.keywordMap)) {
      let score = 0;
      for (const kw of kws) if (t.includes(kw)) score++;
      scores[domain] = score;
    }

    const topDomain = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b), 'general');
    const maxScore = scores[topDomain] || 0;
    const confidence = Math.min(1, maxScore / 3);

    if (confidence > 0.3) {
      return { domain: topDomain, confidence, explanation: `Keyword-based: ${topDomain}` };
    }

    if (this.llmClient && this.llmClient.classify) {
      return await this.llmClient.classify(text);
    }

    return { domain: 'general', confidence: 0.2, explanation: 'Default fallback' };
  }
}
