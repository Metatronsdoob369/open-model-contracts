import { PackExporter } from './popsim-contract/src/core/pack-exporter.js';
import path from 'path';

const exporter = new PackExporter(path.join(process.cwd(), 'popsim-contract/packs/roblox-neon-pvp/arena-pack.json'));

const TOTAL_MANIFEST_PROPOSAL = [
    // ── CORE ARENA ──────────────────────────────────────────────────────────
    { type: "ArenaRoot", properties: { name: "Neon Tag Clash", version: "1.0.0" } },
    { type: "CircularPlatform", properties: { radius: 120, material: "SmoothPlastic", color: "#111111" } },
    { type: "NeonRingBorder", properties: { name: "OuterRing", radius: 121, color: "cyan" } },
    { type: "NeonRingBorder", properties: { name: "InnerRing", radius: 60, color: "magenta" } },
    
    // ── SPAWN SYSTEM ────────────────────────────────────────────────────────
    { type: "SpawnPad", properties: { name: "Spawn_N", position: "north", color: "cyan" } },
    { type: "SpawnPad", properties: { name: "Spawn_S", position: "south", color: "magenta" } },
    { type: "SpawnPad", properties: { name: "Spawn_E", position: "east", color: "cyan" } },
    { type: "SpawnPad", properties: { name: "Spawn_W", position: "west", color: "magenta" } },

    // ── GAMEPLAY SYSTEMS ────────────────────────────────────────────────────
    { type: "PowerUpOrb", properties: { name: "GravityWell", effect: "Slow", color: "yellow" } },
    { type: "PowerUpOrb", properties: { name: "SpeedBurst", effect: "Fast", color: "green" } },
    
    // ── LOGIC (SERVER) ──────────────────────────────────────────────────────
    { type: "GameRoundController", properties: { roundLengthSeconds: 300, minPlayers: 2 } },
    { type: "Script", id: "logic_tag_handler", properties: { name: "TagManager", source: "marsh_core_v1" } },

    // ── ATMOSPHERE (LIGHTING) ───────────────────────────────────────────────
    { type: "LightingConfig", properties: { name: "CyberpunkSky", technology: "Future", brightness: 0.5, ambient: "#000033" } },
    { type: "BloomEffect", id: "effect_bloom", properties: { intensity: 1.5, size: 24, threshold: 0.1 } },

    // ── INTERFACE (GUI) ─────────────────────────────────────────────────────
    { type: "ScreenGuiRoot", properties: { name: "HUD_Main", ignoreGuiInset: true } },
    { type: "TextLabel", id: "gui_timer", properties: { name: "TimerDisplay", text: "00:00", font: "GothamBold" } },
    { type: "Frame", id: "gui_scoreboard", properties: { name: "Scoreboard", size: "{0.2, 0}, {0.3, 0}", position: "{0.8, 0}, {0.1, 0}" } }
];

async function runTotalManifest() {
    console.log("🏙️  INITIATING TOTAL SYSTEM MANIFESTATION: NEON TAG CLASH V1");
    console.log("---------------------------------------------------------");

    const result = exporter.validate(TOTAL_MANIFEST_PROPOSAL);

    if (result.status === "invalid") {
        console.error("🛑 [CRITICAL] MANIFESTATION COLLAPSED:");
        result.missingRequirements.forEach(m => console.error(` - ${m}`));
        return;
    }

    console.log(`✅ STATUS: ${result.status.toUpperCase()} | NODES: ${TOTAL_MANIFEST_PROPOSAL.length}`);
    console.log(`📊 COMPLETENESS: ${result.completenessScore}%`);
    console.log(`🔐 INTEGRITY HASH: ${result.vcs?.metadata.hash}`);
    console.log("---------------------------------------------------------");

    console.log("Part B: Structural Spec (Total DataModel Routing):");
    const root = result.vcs.structuralSpec.root;
    root.children.forEach((service: any) => {
        if (service.children.length > 0) {
            console.log(` ├── ${service.name} [${service.type}]`);
            service.children.forEach((child: any) => {
                console.log(` │   └── ${child.name} [${child.type}]`);
                (child.children ?? []).forEach((sub: any) => {
                    console.log(` │       └── ${sub.name} [${sub.type}]`);
                });
            });
        }
    });

    console.log("\n📡 [FORGE] Executing Total System Publish...");
    const published = await exporter.publishVCS(result.vcs);
    
    if (published) {
        console.log("🚀 TOTAL MANIFESTATION SUCCESSFUL. Bridge Escrow is Locked.");
        console.log("👉 REHYDRATION READY: Open Roblox Studio and start the Rehydrator Plugin.");
    } else {
        console.error("🛑 [FORGE] Bridge Handshake Failed. Manifest in Local Memory Only.");
    }
}

runTotalManifest();
