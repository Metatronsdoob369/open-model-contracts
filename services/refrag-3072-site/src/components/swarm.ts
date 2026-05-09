// Swarm geometry compiler — ports directly from MiroFish/PCB/code.tsx
// Sector hubs swapped: OSINT categories → coalition archetypes

export type Coalition = 'WHALE' | 'REGULATOR' | 'RETAIL' | 'MEDIA' | 'INSTITUTIONAL' | 'DARK'

export interface SwarmAgent {
  id: number
  label: string
  coalition: Coalition
  x: number
  y: number
  isHub: boolean
  weight: number       // influence weight 0-1
  state: 'nominal' | 'reacting' | 'flipped' | 'scattered'
}

export const COALITIONS: Coalition[] = ['WHALE', 'REGULATOR', 'RETAIL', 'MEDIA', 'INSTITUTIONAL', 'DARK']

export const COALITION_COLORS: Record<Coalition, number> = {
  WHALE:         0x1ae8ff,   // SARN cyan
  REGULATOR:     0xe07820,   // SARN orange
  RETAIL:        0x22c55e,   // green
  MEDIA:         0xf59e0b,   // amber
  INSTITUTIONAL: 0x8b5cf6,   // purple
  DARK:          0x6b7280,   // grey — unknown actors
}

export const COALITION_HUB_LABELS: Record<Coalition, string> = {
  WHALE:         'LARGE CAPITAL',
  REGULATOR:     'INSTITUTIONAL / GOV',
  RETAIL:        'CROWD SENTIMENT',
  MEDIA:         'NARRATIVE SHAPERS',
  INSTITUTIONAL: 'FUNDS / QUANT',
  DARK:          'UNKNOWN ACTORS',
}

const AGENT_LABELS: Record<Coalition, string[]> = {
  WHALE: [
    'BlackRock position', 'Soros vehicle', 'SWF rebalance', 'Citadel block',
    'Bridgewater macro', 'Tiger Global exit', 'D.E. Shaw signal', 'Renaissance arb',
    'hedge OTC flow', 'dark pool print', 'prime brokerage', 'block trade',
    'CTA trigger', 'options skew', 'vol surface', 'gamma flip',
    'repo rate', 'swap spread', 'basis trade', 'carry unwind',
  ],
  REGULATOR: [
    'SEC enforcement', 'CFTC inquiry', 'Fed pivot', 'Treasury issuance',
    'BIS warning', 'Basel III', 'OFR systemic', 'FSOC meeting',
    'ESMA ruling', 'FCA guidance', 'congressional bill', 'exec order',
    'subpoena issued', 'consent decree', 'circuit breaker', 'margin call rule',
    'custody rule', 'disclosure req', 'stress test', 'leverage cap',
  ],
  RETAIL: [
    'WSB thread', 'X sentiment', 'Reddit vote', 'TikTok trend',
    'fear index', 'greed gauge', 'put/call ratio', 'options flow',
    'RH order flow', 'Schwab margin', 'retail short', 'meme momentum',
    'discord signal', 'Telegram pump', 'influencer call', 'FOMO wave',
    'dip buy', 'panic sell', 'YOLO bet', 'cash out',
  ],
  MEDIA: [
    'Bloomberg headline', 'WSJ front page', 'FT exclusive', 'Reuters flash',
    'CNBC segment', 'Fox narrative', 'NYT framing', 'Axios scoop',
    'podcast signal', 'Substack thesis', 'analyst note', 'rating change',
    'earnings spin', 'leak play', 'short report', 'long thesis',
    'PR campaign', 'crisis comms', 'denial cycle', 'narrative lock',
  ],
  INSTITUTIONAL: [
    'Vanguard rebal', 'Fidelity flow', 'PIMCO duration', 'BlackRock ETF',
    'pension mandate', 'endowment alloc', 'sovereign fund', 'index inclusion',
    'factor tilt', 'ESG screen', 'quant signal', 'risk parity',
    'vol target', 'momentum factor', 'value rotation', 'quality screen',
    'benchmark track', 'active weight', 'sector rotation', 'EM allocation',
  ],
  DARK: [
    'unknown wallet', 'anon position', 'shell entity', 'offshore vehicle',
    'opaque flow', 'shadow trade', 'unregistered', 'grey market',
    'insider signal?', 'front run?', 'spoofing?', 'wash trade?',
    'algo anomaly', 'flash order', 'phantom bid', 'ghost ask',
    'dark signal', 'zero footprint', 'silent actor', 'ghost coalition',
  ],
}

const CANVAS_W = 1400
const CANVAS_H = 900
const CENTER = { x: CANVAS_W / 2, y: CANVAS_H / 2 }
const HUB_RADIUS = 280
const TRACE_SPACING = 22
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180)

export function buildSwarm(): SwarmAgent[] {
  const agents: SwarmAgent[] = []
  let id = 0

  const hubs = COALITIONS.map((coalition, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180)
    return {
      coalition,
      x: Math.round(CENTER.x + Math.cos(angle) * HUB_RADIUS),
      y: Math.round(CENTER.y + Math.sin(angle) * HUB_RADIUS),
    }
  })

  // Add hubs
  hubs.forEach(h => {
    agents.push({
      id: id++,
      label: COALITION_HUB_LABELS[h.coalition],
      coalition: h.coalition,
      x: h.x,
      y: h.y,
      isHub: true,
      weight: 1,
      state: 'nominal',
    })
  })

  // Add agents per coalition via golden spiral
  COALITIONS.forEach(coalition => {
    const hub = hubs.find(h => h.coalition === coalition)!
    const labels = AGENT_LABELS[coalition]
    labels.forEach((label, i) => {
      const radius = Math.sqrt(i + 1) * TRACE_SPACING
      const angle = i * GOLDEN_ANGLE
      agents.push({
        id: id++,
        label,
        coalition,
        x: Math.round(hub.x + Math.cos(angle) * radius),
        y: Math.round(hub.y + Math.sin(angle) * radius),
        isHub: false,
        weight: Math.random() * 0.8 + 0.2,
        state: 'nominal',
      })
    })
  })

  return agents
}
