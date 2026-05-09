import { useEffect, useRef, useState, useCallback } from 'react'
import anime from '../lib/anime-shim'
import { COALITIONS, COALITION_HUB_LABELS, type Coalition } from './swarm'
import './JostleCanvas.css'

// ── Metallic trace colors ──
const TRACE_COL: Record<Coalition, string> = {
  WHALE:         '#7ab0cc',
  REGULATOR:     '#c88848',
  RETAIL:        '#6aa868',
  MEDIA:         '#c4a038',
  INSTITUTIONAL: '#9080c0',
  DARK:          '#808898',
}

const W = 1400, H = 900
const CX = 700,  CY = 450
const PKG_W = 280, PKG_H = 200
const PKG_X = CX - PKG_W / 2
const PKG_Y = CY - PKG_H / 2
const DIE_W = 180, DIE_H = 120
const DIE_X = CX - DIE_W / 2
const DIE_Y = CY - DIE_H / 2
const RING_R = 368

const SIGNALS: Record<Coalition, string[]> = {
  WHALE: ['BlackRock pos','Soros vehicle','SWF rebal','Citadel block','BridgeW macro','Tiger exit','D.E. Shaw','Ren arb','dark print'],
  REGULATOR: ['SEC enforce','CFTC inquiry','Fed pivot','Treasury','BIS warn','Basel III','OFR systemic','FSOC meet','margin rule'],
  RETAIL: ['WSB thread','X sentiment','Reddit vote','TikTok trend','fear index','greed gauge','put/call','options flow','meme pop'],
  MEDIA: ['Bloomberg','WSJ front','FT exclusive','Reuters flash','CNBC seg','Fox narr','NYT frame','Axios scoop','analyst note'],
  INSTITUTIONAL: ['Vanguard rebal','Fidelity flow','PIMCO dur','BlackRock ETF','pension mandate','endowment','SWF alloc','index inc','risk parity'],
  DARK: ['unknown wallet','anon pos','shell entity','offshore','opaque flow','shadow trade','unreg','grey market','algo anomaly'],
}

const BOOT_LINES = [
  { t: '[SYS] Initializing JOSTLE Provocation Engine...', c: '' },
  { t: '[PCB] Golden Spiral → Circular Endpoint Ring', c: '' },
  { t: '[PCB] Central JOSTLE die mounted', c: 'ok' },
  { t: '[RDY] BOARD IS LIVE', c: 'ok' },
]

const ARC: Record<Coalition, [number, number]> = {
  WHALE: [-150, -90], REGULATOR: [-90, -30], INSTITUTIONAL: [-30, 30], MEDIA: [30, 90], RETAIL: [90, 150], DARK: [150, 210],
}

const ADJACENT: Record<Coalition, Coalition[]> = {
  WHALE:         ['REGULATOR', 'INSTITUTIONAL'],
  REGULATOR:     ['WHALE', 'MEDIA'],
  RETAIL:        ['MEDIA', 'DARK'],
  MEDIA:         ['REGULATOR', 'RETAIL'],
  INSTITUTIONAL: ['WHALE', 'DARK'],
  DARK:          ['RETAIL', 'INSTITUTIONAL'],
}

function exitPoint(c: Coalition, i: number, total: number) {
  const t = total > 1 ? i / (total - 1) : 0.5
  switch (c) {
    case 'WHALE': return { x: DIE_X + t * (DIE_W / 2), y: DIE_Y }
    case 'REGULATOR': return { x: DIE_X + DIE_W / 2 + t * (DIE_W / 2), y: DIE_Y }
    case 'RETAIL': return { x: DIE_X + t * (DIE_W / 2), y: DIE_Y + DIE_H }
    case 'MEDIA': return { x: DIE_X + DIE_W / 2 + t * (DIE_W / 2), y: DIE_Y + DIE_H }
    case 'DARK': return { x: DIE_X, y: DIE_Y + t * DIE_H }
    case 'INSTITUTIONAL': return { x: DIE_X + DIE_W, y: DIE_Y + t * DIE_H }
    default: return { x: CX, y: CY }
  }
}

function ringPoint(c: Coalition, i: number, total: number) {
  const arc = ARC[c] || [0, 0]
  const [s, e] = arc
  const ang = (s + (total > 1 ? i / (total - 1) : 0.5) * (e - s)) * Math.PI / 180
  return { x: CX + RING_R * Math.cos(ang), y: CY + RING_R * Math.sin(ang) }
}

function tracePath(c: Coalition, ex: number, ey: number, rx: number, ry: number) {
  const pull = 110
  let c1x = ex, c1y = ey, c2x = rx, c2y = ry
  switch (c) {
    case 'WHALE': case 'REGULATOR': c1y = ey - pull; c2y = ry + 55; break
    case 'RETAIL': case 'MEDIA': c1y = ey + pull; c2y = ry - 55; break
    case 'DARK': c1x = ex - pull; c2x = rx + 55; break
    case 'INSTITUTIONAL': c1x = ex + pull; c2x = rx - 55; break
  }
  return `M${ex},${ey} C${c1x},${c1y} ${c2x},${c2y} ${rx},${ry}`
}

function playOm(idx: number) {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110 + idx * 22, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(); osc.stop(ctx.currentTime + 1.2)
  } catch (e) {}
}

function pulse(parent: HTMLElement, x: number, y: number, color: string) {
  const el = document.createElement('div')
  el.className = 'cpulse'
  el.style.left = `${x}px`; el.style.top = `${y}px`
  el.style.borderColor = color
  parent.appendChild(el)
  anime({ targets: el, width: [0, 800], height: [0, 800], opacity: [0.6, 0], duration: 1200, easing: 'easeOutExpo', complete: () => el.remove() })
}

const BOARD_W = 1400
const BOARD_H = 900
const SIDEBAR_W = 288
const HEADER_H = 40
const FOOTER_H = 32

export default function JostleCanvas() {
  const boardRef = useRef<HTMLDivElement>(null)
  const bootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<SVGGElement>(null)
  const hudLRef = useRef<HTMLDivElement>(null)
  const hudRRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const ctrlsRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const builtRef = useRef(false)
  const firingRef = useRef(false)
  const [target, setTarget] = useState<Coalition>('MEDIA')
  const [log, setLog] = useState<string[]>([])
  const [hoverNode, setHoverNode] = useState<{ label: string; c: Coalition } | null>(null)
  const [boardTransform, setBoardTransform] = useState('scale(0.72)')

  // Scale board to fill available area, centered
  useEffect(() => {
    const compute = () => {
      const availW = window.innerWidth - SIDEBAR_W
      const availH = window.innerHeight - HEADER_H - FOOTER_H
      const scale = Math.min(availW / BOARD_W, availH / BOARD_H, 1)
      const s = Math.max(scale, 0.4)
      const offsetX = Math.max((availW - BOARD_W * s) / 2, 0)
      const offsetY = Math.max((availH - BOARD_H * s) / 2, 0)
      setBoardTransform(`translate(${offsetX}px, ${offsetY}px) scale(${s})`)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  const addLog = useCallback((txt: string) => {
    setLog(prev => [txt, ...prev].slice(0, 10))
  }, [])

  useEffect(() => {
    if (builtRef.current) return
    builtRef.current = true
    
    const board = boardRef.current!
    const traceSvg = board.querySelector<SVGGElement>('#traceGroup')!
    const nodeCon = board.querySelector<HTMLDivElement>('#nodeCon')!
    const traceEls: Record<string, SVGPathElement> = {}
    const nodeEls: Record<string, HTMLDivElement> = {}

    COALITIONS.forEach((c, si) => {
      SIGNALS[c].forEach((label, i) => {
        const ep = exitPoint(c, i, SIGNALS[c].length)
        const rp = ringPoint(c, i, SIGNALS[c].length)
        const key = `${si}-${i}`

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', tracePath(c, ep.x, ep.y, rp.x, rp.y))
        path.setAttribute('stroke', TRACE_COL[c])
        path.setAttribute('stroke-width', '1.1')
        path.setAttribute('className', 'trace')
        path.setAttribute('fill', 'none')
        path.style.opacity = '0'
        traceSvg.appendChild(path)
        traceEls[key] = path

        const dot = document.createElement('div')
        dot.className = 'node-dot'
        dot.setAttribute('data-coalition', c)
        dot.style.left = `${rp.x}px`; dot.style.top = `${rp.y}px`
        dot.style.background = TRACE_COL[c]; dot.style.opacity = '0'
        
        dot.addEventListener('mouseenter', () => setHoverNode({ label, c }))
        dot.addEventListener('mouseleave', () => setHoverNode(null))
        dot.addEventListener('click', () => {
          if (firingRef.current) return
          setTarget(c)
          fireJostle(c)
        })
        
        nodeCon.appendChild(dot)
        nodeEls[key] = dot
      })
    })

    runBoot(bootRef.current!).then(() => runChoreography(traceEls, nodeEls))
  }, [addLog])

  const fireJostle = useCallback((tCol: Coalition) => {
    if (firingRef.current) return
    firingRef.current = true
    const board = boardRef.current!
    addLog(`PROVOKING ${tCol} COALITION...`)
    playOm(COALITIONS.indexOf(tCol))
    pulse(board, CX, CY, TRACE_COL[tCol])

    const dots = board.querySelectorAll<HTMLDivElement>(`.node-dot[data-coalition="${tCol}"]`)
    anime({ targets: dots, scale: [1, 2, 1], opacity: [1, 0.4, 1], duration: 800, easing: 'easeOutBack' })

    setTimeout(() => {
      ADJACENT[tCol].forEach((adj, idx) => {
        setTimeout(() => {
          playOm(COALITIONS.indexOf(adj))
          pulse(board, CX, CY, TRACE_COL[adj])
          const adjDots = board.querySelectorAll<HTMLDivElement>(`.node-dot[data-coalition="${adj}"]`)
          anime({ targets: adjDots, scale: [1, 1.5, 1], duration: 600, easing: 'easeOutBack' })
          addLog(`  ↳ cascading to ${adj}`)
        }, idx * 300)
      })
    }, 400)

    setTimeout(() => { firingRef.current = false; addLog('SWARM RESTABILIZED.') }, 3500)
  }, [addLog])

  async function runBoot(el: HTMLDivElement) {
    const logEl = el.querySelector<HTMLDivElement>('.boot-log')!
    for (const b of BOOT_LINES) {
      const line = document.createElement('div'); line.textContent = b.t
      logEl.appendChild(line)
      anime({ targets: line, opacity: [0, 1], duration: 200, easing: 'easeOutExpo' })
      await new Promise(r => setTimeout(r, 100))
    }
    await new Promise<void>(r => anime({ targets: el, opacity: [1, 0], duration: 600, delay: 400, easing: 'easeInSine', complete: () => r() }))
    el.style.display = 'none'
  }

  function runChoreography(traces: any, nodes: any) {
    if (titleRef.current) anime({ targets: titleRef.current, opacity: [0, 1], translateY: [-15, 0], duration: 800, easing: 'easeOutExpo' })
    if (chipRef.current) anime({ targets: chipRef.current, opacity: [0, 1], scale: [0.85, 1], duration: 1200, easing: 'easeOutExpo' })

    Object.values(traces).forEach((t: any, i: number) => anime({ targets: t, opacity: [0, 0.45], duration: 600, delay: i * 3, easing: 'easeInSine' }))
    Object.values(nodes).forEach((n: any, i: number) => anime({ targets: n, opacity: [0, 1], scale: [0, 1], duration: 500, delay: i * 3, easing: 'easeOutBack' }))

    if (hudLRef.current) anime({ targets: hudLRef.current, opacity: [0, 1], translateX: [10, 0], duration: 600, delay: 500, easing: 'easeOutExpo' })
    if (hudRRef.current) anime({ targets: hudRRef.current, opacity: [0, 1], translateX: [-10, 0], duration: 600, delay: 700, easing: 'easeOutExpo' })
    if (statusRef.current) anime({ targets: statusRef.current, opacity: [0, 1], translateY: [10, 0], duration: 500, delay: 900, easing: 'easeOutExpo' })
    if (ctrlsRef.current) anime({ targets: ctrlsRef.current, opacity: [0, 1], translateY: [10, 0], duration: 500, delay: 1100, easing: 'easeOutExpo' })
    if (logRef.current) anime({ targets: logRef.current, opacity: [0, 1], duration: 500, delay: 1300, easing: 'easeOutSine' })
  }

  return (
    <div className="jostle-root" style={{ userSelect: 'none' }}>
      <div className="vignette" />
      <div className="scanlines" />

      <div className="pcb-world">
        <div className="pcb-board" ref={boardRef} style={{ transform: boardTransform }}>
          <div className="board-title" ref={titleRef} style={{ opacity: 0, transform: 'translateY(-15px)' }}>
            <h1>JOSTLE — SWARM PROVOCATION</h1>
            <div className="board-sub">NODE: 3072_D_SOVEREIGN ENGINE</div>
          </div>
          <div className="svg-layer">
            <svg viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              <g id="traceGroup" />
              <g className="central-chip-g" ref={chipRef} style={{ opacity: 0 }}>
                <rect x={PKG_X} y={PKG_Y} width={PKG_W} height={PKG_H} rx="6" fill="#101828" stroke="rgba(200,160,64,0.2)" />
                <rect x={DIE_X} y={DIE_Y} width={DIE_W} height={DIE_H} rx="2" fill="#0a0d1a" stroke="rgba(200,160,64,0.35)" />
                <text x={CX} y={CY + 5} textAnchor="middle" className="chip-main-lbl">JOSTLE_V2</text>
                <text x={CX} y={CY + 20} textAnchor="middle" className="chip-sub-lbl">SWARM PROCESSOR</text>
              </g>
            </svg>
          </div>

          <div id="nodeCon" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

          <div id="hud-l" className="hud" style={{ top: 72, left: 24, opacity: 0 }} ref={hudLRef}>
            <div className="hud-glass">
              <div className="hud-title">COALITION MATRIX</div>
              {COALITIONS.map(c => (
                <div key={c} className="hud-row">
                  <div className="hud-label" style={{ color: TRACE_COL[c] }}>{c}</div>
                  <div className="hud-val">{SIGNALS[c].length} sig</div>
                </div>
              ))}
            </div>
          </div>

          <div id="hud-r" className="hud" style={{ top: 72, right: 24, opacity: 0 }} ref={hudRRef}>
            <div className="hud-glass">
              <div className="hud-title">OPERATIONAL INTEL</div>
              <div className="rlog-line" style={{ color: TRACE_COL[target] }}>Target: {target}</div>
              {SIGNALS[target].slice(0, 5).map((s, i) => (
                <div key={i} className="hud-row" style={{ color: 'var(--text-mid)' }}>{s}</div>
              ))}
            </div>
          </div>

          <div className="status-bar" ref={statusRef} style={{ opacity: 0 }}>
            <div className="s-item">DOMICILE <span className="v">3072_D_SOVEREIGN</span></div>
          </div>

          <div className="rlog" ref={logRef} style={{ opacity: 0 }}>
            {log.map((line, i) => (
              <div key={i} className="rlog-line" style={{ color: i === 0 ? '#c4a038' : 'var(--text-dim)' }}>{line}</div>
            ))}
          </div>

          <div className="jostle-controls" ref={ctrlsRef} style={{ opacity: 0, bottom: '60px', left: '50%', transform: 'translateX(-50%)', position: 'absolute' }}>
             <button className="j-fire" onClick={() => fireJostle(target)}>FIRE PROVOCATION</button>
          </div>
        </div>
      </div>

      <div className="boot-screen" ref={bootRef}><div className="boot-log" /></div>
    </div>
  )
}
