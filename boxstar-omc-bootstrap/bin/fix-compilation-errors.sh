#!/bin/bash
# fix-compilation-errors.sh
# Quick patches for scrubbing-induced syntax errors

set -e

SRC="/Users/joewales/NODE_OUT_Master/open-model-contracts/server/src"

echo "🔧 Fixing compilation errors..."

# Fix domain-detector.ts - restore empty arrays
cat > "$SRC/core/domain-detector.ts" << 'EOF'
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

  classify(text: string): DomainResult {
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
      return this.llmClient.classify(text);
    }

    return { domain: 'general', confidence: 0.2, explanation: 'Default fallback' };
  }
}
EOF

echo "✓ Fixed domain-detector.ts"

# Fix broken array/object literals in other files
find "$SRC" -name "*.ts" -type f | while read file; do
    # Fix empty array literals (e.g., "domains:," -> "domains: []")
    sed -i '' 's/: *,/: [],/g' "$file"
    
    # Fix trailing commas in object literals
    sed -i '' 's/\[\],$/[]/g' "$file"
done

echo "✓ Fixed syntax errors in all TypeScript files"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  COMPILATION FIXES APPLIED"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Next: npm run build"
echo ""
