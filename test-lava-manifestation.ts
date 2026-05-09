import { PackExporter } from './popsim-contract/src/core/pack-exporter.js';
import path from 'path';

const exporter = new PackExporter(path.join(process.cwd(), 'popsim-contract/packs/roblox-neon-pvp/arena-pack.json'));

// ── Part A: DNA Injection ──────────────────────────────────────────────────
exporter.injectDNA("LavaFloor", path.join(process.cwd(), "popsim-contract/dna/lava_floor.json"));
exporter.injectDNA("SpeedOrb", path.join(process.cwd(), "popsim-contract/dna/speed_powerup.json"));

const LAVA_ARENA_PROPOSAL = [
    { type: "ArenaRoot", properties: { name: "The Molten Abyss", version: "1.0.0" } },
    { 
        type: "LavaFloor", 
        id: "hazard_floor", 
        properties: { name: "MagmaSurface", radius: 150, color: "#FF4500", material: "Neon" } 
    },
    { 
        type: "SpeedOrb", 
        id: "powerup_1", 
        properties: { name: "SwiftnessOrb_Alpha", position: "north" } 
    },
    { 
        type: "SpawnPad", 
        properties: { name: "SafeSpawn", position: "center", color: "white" } 
    },
    { 
        type: "LightingConfig", 
        properties: { name: "MoltenAtmosphere", technology: "Future", brightness: 0.2, ambient: "#441100" } 
    }
];

async function runLavaManifest() {
    console.log("🌋 INITIATING DNA-INJECTED MANIFESTATION: THE MOLTEN ABYSS");
    console.log("---------------------------------------------------------");

    const result = exporter.validate(LAVA_ARENA_PROPOSAL);

    console.log(`✅ STATUS: ${result.status.toUpperCase()} | HASH: ${result.vcs?.metadata.hash?.substring(0,16)}...`);
    
    console.log("\nPart B: DNA-Routed Hierarchy:");
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

    console.log("\n📡 [FORGE] Executing Lava Strike Publish...");
    const published = await exporter.publishVCS(result.vcs);
    
    if (published) {
        console.log("🚀 LAVA MANIFESTATION SUCCESSFUL. DNA Shards Locked in Escrow.");
    }
}

runLavaManifest();
