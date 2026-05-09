import * as THREE from 'three';

// ── SCENE SETUP ─────────────────────────────────────────────────────────────
const container = document.getElementById('radar-container');
if (!container) throw new Error('radar-container not found');

const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);
renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

camera.position.set(0, 2, 18);
camera.lookAt(0, 0, 0);

// ── BACKGROUND GRID (floor plane, subtle) ────────────────────────────────
const gridHelper = new THREE.GridHelper(28, 28, 0x003344, 0x001a22);
gridHelper.position.y = -4.5;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.55;
scene.add(gridHelper);

// Vertical back-wall cross lines (X and Y axis lines)
function makeLine(p1, p2, color = 0x00eeff, opacity = 0.18) {
    const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2)
    ]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geo, mat);
}
scene.add(makeLine([-14, 0, 0], [14, 0, 0], 0x00eeff, 0.12));  // X axis
scene.add(makeLine([0, -8, 0], [0, 8, 0],   0x00eeff, 0.12));  // Y axis

// ── NEBULA / RADIAL GLOW (flat sprite behind orb) ────────────────────────
const nebulaTexture = (() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    g.addColorStop(0,    'rgba(0, 200, 255, 0.55)');
    g.addColorStop(0.3,  'rgba(0, 140, 220, 0.30)');
    g.addColorStop(0.6,  'rgba(0, 60,  140, 0.12)');
    g.addColorStop(1,    'rgba(0, 0,   0,   0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
})();

const nebulaMat = new THREE.SpriteMaterial({
    map: nebulaTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9
});
const nebula = new THREE.Sprite(nebulaMat);
nebula.scale.set(22, 22, 1);
nebula.position.set(0, 0, -1);
scene.add(nebula);

// ── CENTRAL PULSING CYAN ORB (translucent fresnel) ───────────────────────
const orbGeo = new THREE.SphereGeometry(1.7, 64, 64);
const orbMat = new THREE.ShaderMaterial({
    uniforms: {
        uTime:  { value: 0 },
        uColor: { value: new THREE.Color(0x00eeff) },
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
            vNormal  = normalize(normalMatrix * normal);
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mvPos.xyz);
            gl_Position = projectionMatrix * mvPos;
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform float uTime;
        uniform vec3  uColor;
        void main() {
            float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.5);
            float pulse   = 0.75 + 0.25 * sin(uTime * 1.8);
            float alpha   = fresnel * pulse * 0.75;
            gl_FragColor  = vec4(uColor, alpha);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    depthWrite: false,
});
const centralOrb = new THREE.Mesh(orbGeo, orbMat);
scene.add(centralOrb);

// Inner wireframe sphere (the dark lattice inside the orb)
const wireGeo = new THREE.SphereGeometry(1.4, 14, 10);
const wireMat = new THREE.MeshBasicMaterial({
    color: 0x003344,
    wireframe: true,
    transparent: true,
    opacity: 0.35
});
const innerWire = new THREE.Mesh(wireGeo, wireMat);
scene.add(innerWire);

// ── ORBITAL RING (breach perimeter) ──────────────────────────────────────
const ringGeo = new THREE.TorusGeometry(7.5, 0.03, 8, 120);
const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff3355,
    transparent: true,
    opacity: 0.35
});
const breachRing = new THREE.Mesh(ringGeo, ringMat);
breachRing.rotation.x = Math.PI / 2;
scene.add(breachRing);

// ── SHARD NODES ───────────────────────────────────────────────────────────
const nodeGroup = new THREE.Group();
scene.add(nodeGroup);
const lineGroup = new THREE.Group();
scene.add(lineGroup);

const shardNodes = [];

function makeDropLine(from, to, color, opacity) {
    const points = [];
    const steps  = 20;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        const z = from.z + (to.z - from.z) * t;
        points.push(new THREE.Vector3(x, y, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geo, mat);
}

function manifestNodes(report) {
    // Clear old
    while (nodeGroup.children.length) nodeGroup.remove(nodeGroup.children[0]);
    while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0]);
    shardNodes.length = 0;

    const count = Math.max(report.length, 6);
    const seeds = report.length > 0 ? report : Array.from({ length: 7 }, (_, i) => ({
        id: `SEED_${i}`,
        overallShatter: Math.random() * 0.9,
        heat: Math.random(),
    }));

    // 🎯 VULN SNIPER THREAT CENTROID [4, 4, 4]
    const vulnCentroid = new THREE.Vector3(5, 5, 5); 
    const isVulnMode = window.CURRENT_MODE === 'VULN';

    if (isVulnMode) {
        const vulnGeo = new THREE.SphereGeometry(3, 32, 32);
        const vulnMat = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.1,
            blending: THREE.AdditiveBlending 
        });
        const vulnSphere = new THREE.Mesh(vulnGeo, vulnMat);
        vulnSphere.position.copy(vulnCentroid);
        nodeGroup.add(vulnSphere);

        const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.4 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.copy(vulnCentroid);
        nodeGroup.add(core);
    }

    seeds.slice(0, count).forEach((pt, i) => {
        const isTarget = pt.status === 'VULN_CLUSTER_A';
        const angle  = (i / count) * Math.PI * 2 + Math.PI / 8;
        const r      = isTarget ? 3.5 : (5 + Math.random() * 2.5);
        let x      = Math.cos(angle) * r;
        let y      = (Math.random() - 0.3) * 3.5;
        let z      = Math.sin(angle) * r * 0.4;

        if (isTarget) {
            x = vulnCentroid.x + (Math.random() - 0.5) * 1.5;
            y = vulnCentroid.y + (Math.random() - 0.5) * 1.5;
            z = vulnCentroid.z + (Math.random() - 0.5) * 1.5;
        }

        const shatter = pt.overallShatter ?? Math.random();
        const isHot   = shatter > 0.6 || isTarget;
        // Red for breach nodes, cyan for stable, Neon Red for Sniper targets
        let color   = isTarget ? 0xff0000 : (isHot ? 0xe05070 : 0x00eeff);
        
        if (isVulnMode && !isTarget) color = 0x00ff88; // Safe Green in VULN mode
        
        const radius  = (isTarget ? 0.35 : 0.22) + shatter * 0.22;

        const geom = new THREE.SphereGeometry(radius, 20, 20);
        const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        nodeGroup.add(mesh);

        if (isTarget) {
            // Sniper Reticle for confirmed vulnerabilities
            const wire = new THREE.Mesh(
                new THREE.IcosahedronGeometry(radius * 1.6, 0),
                new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.6 })
            );
            mesh.add(wire);
        }

        // Glow sprite on each node
        const glowTex = (() => {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const ctx = c.getContext('2d');
            const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            const r = isHot ? 220 : 0, g2 = isHot ? 60 : 200, b = isHot ? 80 : 255;
            g.addColorStop(0,   `rgba(${r},${g2},${b},0.9)`);
            g.addColorStop(0.4, `rgba(${r},${g2},${b},0.3)`);
            g.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(c);
        })();
        const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.7
        }));
        glowSprite.scale.set(2.2, 2.2, 1);
        mesh.add(glowSprite);

        // Curved drop-line from node to orb centre
        const line = makeDropLine(
            { x, y, z },
            { x: 0, y: 0, z: 0 },
            isHot ? 0xe05070 : 0x00aabb,
            0.18
        );
        lineGroup.add(line);

        // Vertical anchor to grid
        const anchor = makeDropLine(
            { x, y, z },
            { x, y: -4.5, z },
            0x004455,
            0.25
        );
        lineGroup.add(anchor);

        shardNodes.push({
            mesh,
            originalPos: new THREE.Vector3(x, y, z),
            phase: Math.random() * Math.PI * 2,
            id: pt.id ?? `NODE_${i}`,
            shatter,
        });
    });
}

// ── TELEMETRY ─────────────────────────────────────────────────────────────
let spectralData = [];

async function fetchTelemetry() {
    try {
        const res  = await fetch('/api/telemetry');
        const data = await res.json();
        spectralData = data.spectralReport ?? [];

        const countEl    = document.getElementById('node-count-display');
        const velEl      = document.getElementById('velocity-display');
        const countHdr   = document.getElementById('node-count-header');
        const latencyEl  = document.getElementById('latency-display');
        const latencyMet = document.getElementById('latency-metric');

        if (countEl)   countEl.innerText   = String(spectralData.length).padStart(3, '0');
        if (velEl)     velEl.innerText     = (data.avgShatter ?? 0).toFixed(2) + 'v';
        if (latencyMet) latencyMet.innerText = 'LATENCY: ' + (Math.random() * 0.06 + 0.01).toFixed(2) + 'MS';

        // Pi Node SEC & GPU Integration
        const gpuTxt = document.getElementById('gpu-status-text');
        const piIcons = document.getElementById('pi-status-icon');
        const inboxCount = document.getElementById('pi-inbox-count');
        const triageCount = document.getElementById('pi-triage-count');
        const findingsCount = document.getElementById('pi-findings-count');

        if (data.piStats) {
            if (gpuTxt) {
                gpuTxt.innerText = data.piStats.gpu === 'V3D_ACTIVE' ? 'V3D_CORE_ACTIVE' : 'V3D_ENGINE_OFFLINE';
                gpuTxt.style.color = data.piStats.gpu === 'V3D_ACTIVE' ? '#7bd1fa' : '#64748b';
            }
            if (piIcons) {
                piIcons.style.color = data.piStats.gpu === 'V3D_ACTIVE' ? '#10b981' : '#f43f5e';
                piIcons.innerText = data.piStats.gpu === 'V3D_ACTIVE' ? 'online_prediction' : 'shutter_speed';
            }
            if (inboxCount)    inboxCount.innerText    = data.piStats.inbox;
            if (triageCount)   triageCount.innerText   = data.piStats.triage;
            if (findingsCount) findingsCount.innerText = data.piStats.findings;
        }

        // Rebuild node health list
        buildHealthList(spectralData);

        if (Math.abs(spectralData.length - shardNodes.length) > 1 || shardNodes.length === 0) {
            manifestNodes(spectralData);
        }
    } catch (_) {
        if (shardNodes.length === 0) manifestNodes([]);
    }
}

function buildHealthList(pts) {
    const list = document.getElementById('node-health-list');
    if (!list) return;
    if (!pts.length) {
        list.innerHTML = '<div class="text-[9px] font-mono text-slate-600 uppercase tracking-widest py-4 text-center">Awaiting Spectral Feed...</div>';
        return;
    }
    list.innerHTML = pts.slice(0, 12).map(p => {
        const v      = (p.overallShatter ?? 0).toFixed(2);
        const cls    = p.overallShatter > 0.7 ? 'val-breach' : p.overallShatter > 0.4 ? 'val-warning' : 'val-stable';
        const label  = (p.id ?? 'UNKNOWN').replace(/\.(lua|ts)$/i, '').slice(0, 20);
        return `<div class="node-health-row">
            <span class="label">${label}</span>
            <span class="val ${cls}">${v}v</span>
        </div>`;
    }).join('');
}

// Initial seed render immediately
manifestNodes([]);
fetchTelemetry();
setInterval(fetchTelemetry, 4000);

// ── AXIS NAVIGATION ───────────────────────────────────────────────────────
const AXIS_VIEWS = {
    'X-AXIS':   { pos: [0, 2, 18],   target: [0, 0, 0] },
    'Y-AXIS':   { pos: [18, 0, 0],   target: [0, 0, 0] },
    'Z-DEPTH':  { pos: [0, 14, 0],   target: [0, 0, 0] },
    'T-CHRONE': { pos: [-10, 5, 14], target: [0, 0, 0] },
    'VULN':     { pos: [5, 6, 12],   target: [5, 5, 5] },
};
window.CURRENT_MODE = 'NORMAL';
let targetPos    = new THREE.Vector3(0, 2, 18);
let targetLookAt = new THREE.Vector3(0, 0, 0);

function setAxis(axisName) {
    const view = AXIS_VIEWS[axisName];
    if (!view) return;
    targetPos.set(...view.pos);
    targetLookAt.set(...view.target);

    // Update active tab styling
    document.querySelectorAll('[data-axis]').forEach(el => {
        const active = el.dataset.axis === axisName;
        el.classList.toggle('axis-tab-active', active);
        el.classList.toggle('text-sky-400', active);
        el.classList.toggle('text-slate-500', !active);
    });
}
window.setAxis = setAxis;

// Wire up axis tabs
document.querySelectorAll('[data-axis]').forEach(el => {
    el.addEventListener('click', () => {
        window.CURRENT_MODE = el.dataset.axis === 'VULN' ? 'VULN' : 'NORMAL';
        setAxis(el.dataset.axis);
        manifestNodes(spectralData); // Hot reload on mode swap
    });
});
// Default active
setAxis('X-AXIS');

// ── ORBIT DRAG ────────────────────────────────────────────────────────────
let isDragging = false, prevMouse = { x: 0, y: 0 };
let orbitTheta = 0, orbitPhi = Math.PI / 6, orbitR = 18;

renderer.domElement.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    orbitTheta -= dx * 0.008;
    orbitPhi    = Math.max(0.1, Math.min(Math.PI - 0.1, orbitPhi + dy * 0.006));
    prevMouse   = { x: e.clientX, y: e.clientY };
    targetPos.set(
        orbitR * Math.sin(orbitPhi) * Math.sin(orbitTheta),
        orbitR * Math.cos(orbitPhi),
        orbitR * Math.sin(orbitPhi) * Math.cos(orbitTheta)
    );
});
renderer.domElement.addEventListener('wheel', e => {
    orbitR = Math.max(8, Math.min(35, orbitR + e.deltaY * 0.02));
    targetPos.normalize().multiplyScalar(orbitR);
});

// ── NODE HOVER (spec card) ─────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();
const specCard  = document.getElementById('node-spec-card');

renderer.domElement.addEventListener('mousemove', e => {
    if (!specCard) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set(
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
       -((e.clientY - rect.top)  / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(nodeGroup.children, true);
    if (hits.length) {
        const idx  = nodeGroup.children.indexOf(hits[0].object);
        const node = shardNodes[idx];
        if (node) {
            specCard.classList.remove('hidden');
            specCard.style.left = (e.clientX - rect.left + 12) + 'px';
            specCard.style.top  = (e.clientY - rect.top  - 20) + 'px';
            const idEl    = document.getElementById('spec-card-id');
            const roomEl  = document.getElementById('spec-card-room');
            const shatter = document.getElementById('spec-card-shatter');
            const heat    = document.getElementById('spec-card-heat');
            if (idEl)    idEl.innerText    = node.id;
            if (roomEl)  roomEl.innerText  = node.shatter > 0.7 ? 'BREACH ZONE' : 'STABLE ORBIT';
            if (shatter) shatter.innerText = node.shatter.toFixed(3) + 'v';
            if (heat)    heat.innerText    = (node.shatter * 0.9).toFixed(3);
        }
    } else {
        specCard?.classList.add('hidden');
    }
});

// ── PHASE CLOCK ───────────────────────────────────────────────────────────
const clockHand = document.getElementById('clock-hand');
const clockPhase = document.getElementById('clock-phase-text');
const phases = ['idle_loop', 'sync_fabric', 'breach_scan', 'temporal_lock', 'escrow_gate', 'sovereign'];
let phaseIdx = 0;

function tickClock(t) {
    if (!clockHand) return;
    const angle = (t * 15) % 360;
    const rad   = (angle - 90) * Math.PI / 180;
    const x2    = 50 + 40 * Math.cos(rad);
    const y2    = 50 + 40 * Math.sin(rad);
    clockHand.setAttribute('x2', x2.toFixed(1));
    clockHand.setAttribute('y2', y2.toFixed(1));
    if (Math.floor(t) % 4 === 0 && clockPhase) {
        clockPhase.textContent = phases[phaseIdx % phases.length];
        phaseIdx++;
    }
}

// ── ANIMATION LOOP ────────────────────────────────────────────────────────
const tmpLook = new THREE.Vector3();
function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() / 1000;

    // Update shader time
    orbMat.uniforms.uTime.value = t;

    // Smooth camera move toward target
    camera.position.lerp(targetPos, 0.04);
    tmpLook.lerp(targetLookAt, 0.06);
    camera.lookAt(tmpLook);

    // Orb rotation
    centralOrb.rotation.y += 0.004;
    innerWire.rotation.y  -= 0.003;
    innerWire.rotation.x  += 0.002;

    // Breach ring pulse
    breachRing.material.opacity = 0.25 + 0.12 * Math.sin(t * 0.8);

    // Nebula pulse
    nebulaMat.opacity = 0.7 + 0.15 * Math.sin(t * 1.2);

    // Shard node float + pulse
    shardNodes.forEach(node => {
        const p = 0.5 + 0.5 * Math.sin(t * 1.8 + node.phase);
        node.mesh.material.opacity = 0.5 + p * 0.5;
        node.mesh.scale.setScalar(0.85 + p * 0.3);
        node.mesh.position.y = node.originalPos.y + Math.sin(t * 0.9 + node.phase) * 0.18;
    });

    // Slow orbital drift of whole node group
    nodeGroup.rotation.y += 0.0006;
    lineGroup.rotation.y  = nodeGroup.rotation.y;

    tickClock(t);
    renderer.render(scene, camera);
}

// ── RESIZE ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// ── CONSOLE TOGGLE ────────────────────────────────────────────────────────
window.toggleConsole = function() {
    const c = document.getElementById('command-console');
    if (!c) return;
    c.classList.toggle('h-12');
    c.classList.toggle('h-64');
};

// ── RADAR LEGEND TOGGLE ───────────────────────────────────────────────────
const legendBtn   = document.getElementById('radar-legend-toggle');
const legendPanel = document.getElementById('radar-legend-panel');
if (legendBtn && legendPanel) {
    legendBtn.addEventListener('click', () => legendPanel.classList.toggle('hidden'));
}

// ── BUTTON WIRING ─────────────────────────────────────────────────────────
document.getElementById('btn-init-hero')?.addEventListener('click', () => {
    document.getElementById('command-deck')?.scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('btn-init-jump')?.addEventListener('click', () => {
    manifestNodes(spectralData);
});
document.getElementById('btn-cta-bottom')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.getElementById('btn-repair-trigger')?.addEventListener('click', () => {
    const el = document.getElementById('console-output');
    if (el) el.innerHTML += `<div class="console-line text-amber-400">[REPAIR] Temporal fracture scan initiated at t=${performance.now().toFixed(0)}ms</div>`;
});

animate();
