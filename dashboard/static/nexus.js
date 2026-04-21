import { QuadMapRenderer } from '/QuadMapRenderer.js';

console.log('📡 [NEXUS] Orchestrator Igniting...');

let quadRenderer;
const knownLogs = new Set();
const knownShatters = new Set();

// ── Graph Context Panel ─────────────────────────────────────────────────────

let graphData = null; // { nodes: [...], links: [...] } from graph.json

async function loadGraphData() {
    try {
        const res = await fetch('/api/graph');
        if (!res.ok) return;
        graphData = await res.json();
        console.log(`📊 [GRAPH] Loaded: ${graphData.nodes?.length} nodes, ${graphData.links?.length} edges`);
    } catch (e) {
        console.warn('[GRAPH] graph.json unavailable — context panel disabled');
    }
}

function openGraphPanel(radarNodeId) {
    if (!graphData) return;

    // Match radar node ID to graph node — try exact, then partial
    const nodes = graphData.nodes || [];
    const links = graphData.links || [];

    let match = nodes.find(n => n.id === radarNodeId)
        || nodes.find(n => n.id?.toLowerCase().includes(radarNodeId?.toLowerCase()))
        || nodes.find(n => radarNodeId?.toLowerCase().includes(n.label?.toLowerCase().split(' ')[0]));

    if (!match) {
        // Fall back to showing the highest-centrality node as a demo
        match = nodes.reduce((best, n) => {
            const deg = links.filter(l => l.source === n.id || l.target === n.id).length;
            const bestDeg = links.filter(l => l.source === best?.id || l.target === best?.id).length;
            return deg > bestDeg ? n : best;
        }, nodes[0]);
    }
    if (!match) return;

    const nodeLinks = links.filter(l => l.source === match.id || l.target === match.id);
    const degree = nodeLinks.length;
    const community = match.community ?? match.community_id ?? '—';
    const communityLabel = match.community_label || `Community ${community}`;

    // Centrality proxy: degree / total nodes
    const centrality = (degree / Math.max(nodes.length, 1)).toFixed(3);

    // God node threshold: top 15% by degree
    const allDegrees = nodes.map(n => links.filter(l => l.source === n.id || l.target === n.id).length);
    allDegrees.sort((a, b) => b - a);
    const godThreshold = allDegrees[Math.floor(allDegrees.length * 0.15)] || 4;
    const isGodNode = degree >= godThreshold;

    // Populate panel
    document.getElementById('gp-node-id').textContent = match.id;
    document.getElementById('gp-node-label').textContent = match.label || match.id;
    document.getElementById('gp-community-badge').textContent = communityLabel;
    document.getElementById('gp-centrality').textContent = `${degree} connections · centrality ${centrality}`;

    const godAlert = document.getElementById('gp-god-alert');
    if (isGodNode) {
        godAlert.classList.remove('hidden');
        document.getElementById('gp-god-reason').textContent =
            `${degree} edges place this node in the top 15% by connectivity. Changes here propagate across multiple communities.`;
    } else {
        godAlert.classList.add('hidden');
    }

    // Connections list
    const connEl = document.getElementById('gp-connections');
    connEl.innerHTML = '';
    const outgoing = nodeLinks.filter(l => l.source === match.id);
    const incoming = nodeLinks.filter(l => l.target === match.id);

    const renderLink = (l, direction) => {
        const otherId = direction === 'out' ? l.target : l.source;
        const other = nodes.find(n => n.id === otherId);
        const otherLabel = other?.label || otherId;
        const rel = l.relation || 'references';
        const conf = l.confidence || 'EXTRACTED';
        const confColor = conf === 'EXTRACTED' ? 'text-emerald-400/60' : conf === 'INFERRED' ? 'text-sky-400/60' : 'text-amber-400/60';
        const arrow = direction === 'out' ? '→' : '←';

        const div = document.createElement('div');
        div.className = 'flex items-start gap-2 py-1.5 px-2 hover:bg-white/[0.03] transition-colors group cursor-default';
        div.innerHTML = `
            <span class="font-mono text-[9px] text-slate-600 mt-px w-3 shrink-0">${arrow}</span>
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="font-mono text-[8px] text-slate-500 bg-white/[0.04] px-1.5 py-px">${rel}</span>
                    <span class="font-mono text-[7px] ${confColor}">${conf}</span>
                </div>
                <p class="font-body text-[10px] text-slate-300 font-light leading-snug truncate">${otherLabel}</p>
            </div>`;
        connEl.appendChild(div);
    };

    outgoing.forEach(l => renderLink(l, 'out'));
    incoming.forEach(l => renderLink(l, 'in'));

    if (nodeLinks.length === 0) {
        connEl.innerHTML = '<p class="font-mono text-[9px] text-slate-700">No connections in graph index.</p>';
    }

    // Community bridges: links that cross community boundaries
    const bridges = nodeLinks.filter(l => {
        const otherId = l.source === match.id ? l.target : l.source;
        const other = nodes.find(n => n.id === otherId);
        return other && other.community !== match.community;
    });

    const bridgesWrap = document.getElementById('gp-bridges-wrap');
    const bridgesEl = document.getElementById('gp-bridges');
    if (bridges.length > 0) {
        bridgesWrap.classList.remove('hidden');
        bridgesEl.innerHTML = '';
        bridges.forEach(l => {
            const otherId = l.source === match.id ? l.target : l.source;
            const other = nodes.find(n => n.id === otherId);
            const div = document.createElement('div');
            div.className = 'flex items-center gap-2 py-1';
            div.innerHTML = `
                <div class="w-1.5 h-1.5 rounded-full bg-sky-400/40 shrink-0"></div>
                <p class="font-mono text-[9px] text-slate-500 leading-snug">${other?.community_label || `Community ${other?.community}`} <span class="text-slate-700">via</span> <span class="text-slate-400">${l.relation || 'link'}</span></p>`;
            bridgesEl.appendChild(div);
        });
    } else {
        bridgesWrap.classList.add('hidden');
    }

    // Show panel
    const panel = document.getElementById('graph-panel');
    const backdrop = document.getElementById('graph-panel-backdrop');
    panel.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    requestAnimationFrame(() => { panel.style.transform = 'translateX(0)'; });
}

window.closeGraphPanel = function() {
    const panel = document.getElementById('graph-panel');
    const backdrop = document.getElementById('graph-panel-backdrop');
    panel.style.transform = 'translateX(100%)';
    setTimeout(() => {
        panel.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 300);
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('graph-panel-close')?.addEventListener('click', window.closeGraphPanel);
    loadGraphData();
});

/**
 * Initialize the 4D Sovereign Engine
 */
function initRadar() {
    try {
        console.log('📡 [NEXUS] Mounting Radar Container...');
        quadRenderer = new QuadMapRenderer('radar-container');
        
        // Click → open graph context panel
        quadRenderer.onClickNode = (node) => {
            if (node) openGraphPanel(node.id);
        };

        // Connect the Interactivity Handshake to the UI Spec Card
        quadRenderer.onHoverNode = (node) => {
            const card = document.getElementById('node-spec-card');
            if (!node) {
                card.classList.add('hidden');
                return;
            }

            card.classList.remove('hidden');
            document.getElementById('spec-card-id').innerText = node.id;
            document.getElementById('spec-card-room').innerText = node.room;
            document.getElementById('spec-card-shatter').innerText = (node.temporalSignatures && node.temporalSignatures[0]?.shatterVelocity || 0).toFixed(2) + 'v';
            document.getElementById('spec-card-heat').innerText = (node.heat * 100).toFixed(1) + '℃';
            document.getElementById('spec-card-phase').innerText = (node.temporalSignatures && node.temporalSignatures[0]?.phase) || 'IDLE';
            
            const gate = document.getElementById('spec-card-gate');
            const shatter = (node.temporalSignatures && node.temporalSignatures[0]?.shatterVelocity) || 0;
            if (shatter > 0.95) {
                gate.innerText = 'BREACH';
                gate.className = 'font-headline text-[9px] tracking-widest px-2 py-0.5 bg-rose-500/20 text-rose-400';
            } else if (shatter > 0.65) {
                gate.innerText = 'STAGED';
                gate.className = 'font-headline text-[9px] tracking-widest px-2 py-0.5 bg-amber-500/20 text-amber-400';
            } else {
                gate.innerText = 'TRUSTED';
                gate.className = 'font-headline text-[9px] tracking-widest px-2 py-0.5 bg-emerald-500/20 text-emerald-400';
            }
        };

        // Wire axis buttons
        document.querySelectorAll('.axis-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const axis = btn.dataset.axis;
                quadRenderer.setCameraView(axis);
                // Update active style
                document.querySelectorAll('.axis-btn').forEach(b => {
                    b.classList.remove('text-tertiary', 'border-b', 'border-tertiary', 'pb-1');
                    b.classList.add('text-slate-500');
                });
                btn.classList.remove('text-slate-500');
                btn.classList.add('text-tertiary', 'border-b', 'border-tertiary', 'pb-1');
            });
        });

        console.log('📡 [NEXUS] Sovereign Engine Manifested.');
        
        // Push initial seeds instantly to prevent "Black Void"
        quadRenderer.updateNodes([
            { id: 'SEED_CENTROID', room: 'WorldState', spatialEmbedding: [0.5, 0.5, 0.5], heat: 0.1, temporalSignatures: [{ shatterVelocity: 0.05, phase: 'STABLE' }] },
            { id: 'SEED_ANOMALY', room: 'Client_Visual', spatialEmbedding: [0.8, 0.2, 0.7], heat: 0.8, temporalSignatures: [{ shatterVelocity: 0.96, phase: 'BREACH' }] }
        ]);
    } catch(e) {
        console.error('❌ [NEXUS] Engine Ignition Failed:', e);
    }
}

/**
 * Command Console Integration
 */
function addConsoleLog(text, type = 'info') {
    const output = document.getElementById('console-output');
    if (!output) return;

    const line = document.createElement('div');
    line.className = 'console-line p-1 px-3 border-l-2 border-transparent hover:bg-white/5 transition-all';
    
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let colorClass = 'text-slate-400';
    if (type === 'warn') colorClass = 'text-amber-400/80';
    if (type === 'error') colorClass = 'text-rose-400';
    if (type === 'success') colorClass = 'text-emerald-400';
    if (type === 'omc') colorClass = 'text-tertiary';

    line.innerHTML = `<span class="opacity-30 mr-2 text-[8px] font-mono">[${timestamp}]</span> <span class="text-[10px] font-mono ${colorClass}">${text}</span>`;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

/**
 * Telemetry Heartbeat
 */
async function syncTelemetry() {
    try {
        const res = await fetch('/api/telemetry');
        if (!res.ok) throw new Error('Bridge Offline');
        
        const data = await res.json();
        
        // Update Radar & Counters
        if (data.spectralReport) {
            // Adapter: mapBatch shape → CanonicalNode4D shape
            const ROOMS = ['WorldState', 'Client_Visual', 'Threading', 'DataLayer'];
            const canonicalNodes = data.spectralReport.map((p, i) => {
                const shatter = p.overallShatter || 0;
                const heat = p.spatial?.shatterVariance ?? shatter;
                const angle = (i / data.spectralReport.length) * Math.PI * 2;
                const radius = 0.2 + shatter * 0.6;
                return {
                    id: p.id || `node-${i}`,
                    room: ROOMS[i % ROOMS.length],
                    spatialEmbedding: [
                        0.5 + Math.cos(angle) * radius,
                        heat,
                        0.5 + Math.sin(angle) * radius
                    ],
                    heat,
                    temporalSignatures: [{ shatterVelocity: shatter, phase: shatter > 0.95 ? 'BREACH' : shatter > 0.65 ? 'STAGED' : 'STABLE' }]
                };
            });
            if (quadRenderer) quadRenderer.updateNodes(canonicalNodes);
            
            // Sovereignty Counters & HUD
            const nodeCount = data.spectralReport.length;
            document.getElementById('node-count-display').innerText = nodeCount.toString().padStart(3, '0');
            document.getElementById('node-count-header').innerText = `${nodeCount} / ${nodeCount}`;
            
            const avgShatter = data.spectralReport.reduce((acc, p) => acc + (p.overallShatter || 0), 0) / nodeCount;
            document.getElementById('velocity-display').innerText = `${avgShatter.toFixed(2)}v`;
            
            // Populate Node Health List (Column 1)
            const healthList = document.getElementById('node-health-list');
            if (healthList) {
                healthList.innerHTML = '';
                data.spectralReport.forEach(node => {
                    const shatter = node.overallShatter || 0;
                    const status = shatter > 0.95 ? 'BREACH' : (shatter > 0.65 ? 'STAGED' : 'TRUSTED');
                    const color = shatter > 0.95 ? 'text-rose-400' : (shatter > 0.65 ? 'text-amber-400' : 'text-emerald-400');
                    
                    const item = document.createElement('div');
                    item.className = 'flex justify-between items-center py-2 border-b border-white/5 hover:bg-white/5 px-2 transition-all cursor-pointer';
                    item.innerHTML = `
                        <div class="flex flex-col">
                            <span class="text-[9px] font-mono text-slate-400 truncate w-32">${node.id}</span>
                            <div class="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                <div class="h-full bg-emerald-400/40" style="width: ${Math.max(20, 100 - (shatter * 100))}%"></div>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[8px] font-headline tracking-widest ${color}">${status}</span>
                            <span class="text-[8px] font-mono text-slate-500">${shatter.toFixed(3)}v</span>
                        </div>
                    `;
                    healthList.appendChild(item);
                });
            }
        }

        // Update Logs
        if (data.auditLog) {
            data.auditLog.forEach(log => {
                const key = `${log.time}_${log.msg}`;
                if (!knownLogs.has(key)) {
                    addConsoleLog(log.msg, log.type === 'Sentry' ? 'warn' : 'omc');
                    knownLogs.add(key);
                }
            });
        }
    } catch(e) {
        // Fallback simulation
        if (Math.random() > 0.8) {
            addConsoleLog("Sovereign Handshake: Awaiting heartbeat...", "warn");
        }
    }
}

// 🛡️ UI Listeners 🛡️

// Legend Toggle
document.getElementById('radar-legend-toggle')?.addEventListener('click', () => {
    console.log('📡 [NEXUS] Legend Toggled');
    const panel = document.getElementById('radar-legend-panel');
    panel.classList.toggle('hidden');
});

// INITIALIZE ORCHESTRATION
document.getElementById('btn-init-hero')?.addEventListener('click', () => {
    document.getElementById('command-deck').scrollIntoView({ behavior: 'smooth' });
    addConsoleLog("Orchestration sequence initialized. Synchronizing 4D fabric.", "success");
});

document.getElementById('btn-cta-bottom')?.addEventListener('click', () => {
    document.getElementById('command-deck').scrollIntoView({ behavior: 'smooth' });
});

// TERMINAL / CONSOLE
document.getElementById('btn-terminal')?.addEventListener('click', () => {
    const console = document.getElementById('command-console');
    console.classList.toggle('h-12');
    console.classList.toggle('h-64');
});

// Global Mouse Move for Spec Card positioning
window.addEventListener('mousemove', (e) => {
    const card = document.getElementById('node-spec-card');
    if (card && !card.classList.contains('hidden')) {
        card.style.left = (e.clientX + 20) + 'px';
        card.style.top = (e.clientY + 20) + 'px';
    }
});

// 💎 VISUAL REVEAL HANDSHAKE 💎
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('📡 [NEXUS] Visibility Threshold Breach: COMMAND_DECK');
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up-element').forEach(el => {
    observer.observe(el);
});

// Start Cycles
initRadar();
setInterval(syncTelemetry, 3000);
syncTelemetry();
