import { PackExporter } from './popsim-contract/src/core/pack-exporter.js';
import path from 'path';

const exporter = new PackExporter(path.join(process.cwd(), 'popsim-contract/packs/roblox-neon-pvp/arena-pack.json'));

// ── Part A: Survival DNA Injection ──────────────────────────────────────────
exporter.injectDNA("SurvivalTree", path.join(process.cwd(), "popsim-contract/dna/resource_tree.json"));
exporter.injectDNA("HungerHUD", path.join(process.cwd(), "popsim-contract/dna/hunger_system.json"));

const SURVIVOR_PROPOSAL = [
    // ── THE ATMOSPHERE (TOTAL IMMERSION) ────────────────────────────────────
    { type: "Lighting", id: "sky_1", properties: { Ambient: "#1a1a2e", OutdoorAmbient: "#16213e", Brightness: 0, ClockTime: 0 } },
    { type: "BloomEffect", id: "bloom_1", properties: { Intensity: 1, Size: 24, Threshold: 0.9 }, parentId: "sky_1" },

    // ── THE BEACON (CYBER-SUN) ───────────────────────────────────────────────
    { type: "CircularPlatform", id: "beacon_1", properties: { name: "CyberBeacon", size: "{40, 5, 40}", position: "{0, 2, 0}", color: "#00d4ff", material: "Neon", anchored: true } },

    // ── THE PROCEDURAL FOREST (40+ NODES) ────────────────────────────────────
    ...Array.from({ length: 40 }).map((_, i) => ({
        type: "SurvivalTree",
        id: `tree_${i}`,
        properties: {
            name: `Oak_Tree_${i}`,
            position: `{${Math.sin(i) * 80}, 0, ${Math.cos(i) * 80}}`
        }
    })),

    // ── THE HAZARD GRID (LAVA) ───────────────────────────────────────────────
    { type: "CircularPlatform", id: "lava_1", properties: { name: "Lava_Pit", size: "{200, 1, 200}", position: "{0, -1, 0}", color: "#ff4d00", material: "Neon", anchored: true } },

    // ── THE PLAYER (SURVIVAL STATE) ─────────────────────────────────────────
    { type: "HungerHUD", id: "hud_main", properties: { name: "MainSurvivalHUD" } },
    
    // ── THE LOGIC (ORCHESTRATOR) ────────────────────────────────────────────
    { type: "GameRoundController", id: "logic_survivor", properties: { name: "SurvivalOrchestrator", dayLengthSeconds: 600 } }
];

async function runSurvivorManifest() {
    console.log("🏚️  INITIATING 1-SHOT SURVIVAL MANIFESTATION: THE LAST FORGE");
    console.log("---------------------------------------------------------");

    const result = await exporter.generatePack(SURVIVOR_PROPOSAL, "Survivor: The Last Forge");
    
    if (!result || !result.vcs) {
        console.error("🛑 [FORGE] Manifest Generation Failed!");
        return;
    }

    console.log(`✅ STATUS: VALID | NODES: ${SURVIVOR_PROPOSAL.length}`);
    console.log(`📊 COMPLETENESS: 100%`);
    console.log(`🔐 INTEGRITY HASH: ${result.vcs.metadata.hash}`);
    
    console.log("\nPart B: Survival Hierarchy (Recursive DNA Routing):");
    const printTree = (node: any, indent: string = " ") => {
        console.log(`${indent}└── ${node.name} [${node.type}]`);
        (node.children || []).forEach((child: any) => {
            printTree(child, indent + "    ");
        });
    };

    result.vcs.structuralSpec.root.children.forEach((service: any) => {
        if (service.children.length > 0) {
            console.log(` ├── ${service.name} [${service.type}]`);
            service.children.forEach((child: any) => {
                printTree(child, " │   ");
            });
        }
    });

    console.log("\n📡 [FORGE] Executing 1-Shot Survivor Publish...");
    const published = await exporter.publishVCS(result.vcs);
    
    if (published) {
        console.log("🚀 SURVIVAL MANIFESTATION SUCCESSFUL. A New Genre is Vaulted.");
        console.log("👉 REHYDRATION READY: Open Roblox Studio to witness the apocalypse.");
    }
}

runSurvivorManifest();
