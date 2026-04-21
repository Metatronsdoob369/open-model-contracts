#!/usr/bin/env ts-node
/**
 * OMC Classifier - TypeScript Edition (Phase 3.5 Ready)
 * Ported from the Python version with improvements for your TS/Luau pipeline.
 * 
 * Usage:
 *   npx ts-node src/omc-classifier.ts extraction.json [overrides.json] [--best-effort]
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Command } from 'commander';
import { z } from 'zod'; // Optional: for extra validation if you want Zod-style safety here too

// ─────────────────────────────────────────────────────────────────────────────
// Room Rules (same structure as before, now typed)
interface ClassificationRule {
    room: string;
    priority: number;
    namePatterns: RegExp[];
    codePatterns: RegExp[];
}

const ROOM_RULES: ClassificationRule[] = [
    // Client_Visual - highest priority
    {
        room: "Client_Visual",
        priority: 10,
        namePatterns: [/Highlight/i, /BillboardGui/i, /Particle/i, /CameraShake/i, /Rowdy/i, /ITPlayer/i, /TagVisual/i, /HUD/i, /VisualChaos/i],
        codePatterns: [/Highlight/, /BillboardGui/, /ParticleEmitter/, /TweenService/, /Camera/],
    },
    // OMC_EventBus
    {
        room: "OMC_EventBus",
        priority: 9,
        namePatterns: [/RemoteEvent/, /RemoteFunction/, /ScriptSignal/, /ScriptConnection/, /:Connect/, /:Fire/],
        codePatterns: [/OnClientEvent/, /OnServerEvent/, /FireServer/, /FireClient/],
    },
    // OMC_Threading
    {
        room: "OMC_Threading",
        priority: 9,
        namePatterns: [/FreeRunnerThread/, /AcquireRunnerThread/, /task\.spawn/, /task\.defer/],
        codePatterns: [/task\.spawn/, /task\.wait/, /coroutine/, /FreeRunnerThread/],
    },
    // OMC_DataStore_Queue
    {
        room: "OMC_DataStore_Queue",
        priority: 9,
        namePatterns: [/CustomWriteQueue/, /WriteQueueAsync/, /QueueAsync/],
        codePatterns: [/UpdateAsync/, /SetAsync/, /GetAsync/, /WriteCooldown/],
    },
    // OMC_Governance
    {
        room: "OMC_Governance",
        priority: 9,
        namePatterns: [/Contract/, /Gate/, /Admission/, /Audit/, /Sovereign/],
        codePatterns: [/z\.object/, /SAFE/, /ARMED/, /Governance/],
    },
    // Mock_TestLayer
    {
        room: "Mock_TestLayer",
        priority: 8,
        namePatterns: [/Mock/, /Test/, /Spec/, /Suite/],
        codePatterns: [/expect/, /describe/, /it\(/, /test\(/],
    },
];

// Simple classification function
function classifyFunction(funcSignature: string, rawCodeSnippet?: string): any {
    let bestRoom = "UNCLASSIFIED";
    let bestPriority = -1;
    let matchCount = 0;
    const snippetLower = rawCodeSnippet?.toLowerCase() || "";

    for (const rule of ROOM_RULES) {
        let ruleMatches = 0;

        for (const pattern of rule.namePatterns) {
            if (pattern.test(funcSignature)) ruleMatches++;
        }
        for (const pattern of rule.codePatterns) {
            if (pattern.test(snippetLower)) ruleMatches += 2; // code weighs heavier
        }

        if (ruleMatches > 0 && (rule.priority > bestPriority || (rule.priority === bestPriority && ruleMatches > matchCount))) {
            bestPriority = rule.priority;
            bestRoom = rule.room;
            matchCount = ruleMatches;
        }
    }

    const confidence = bestPriority >= 9 || matchCount >= 4 ? "high" :
        bestPriority >= 7 || matchCount >= 2 ? "medium" : "low";

    // Circadian Weighting: High-signal logic (DNA) gets higher training scores
    const trainingValue = ["OMC_Threading", "OMC_DataStore_Queue", "OMC_Governance", "Client_Visual"].includes(bestRoom) ? 95 :
        bestRoom === "Mock_TestLayer" ? 85 :
        bestRoom.startsWith("ROOM") ? 75 : 40;

    return {
        function: funcSignature,
        omc_room: bestRoom,
        confidence,
        match_count: matchCount,
        training_value_score: trainingValue,
        manual_override: null,
        override_reason: null,
    };
}

// Main classification logic
async function classifyExtraction(extractionPath: string, overridesPath?: string, bestEffort: boolean = false) {
    console.log(`📂 Processing: ${extractionPath}`);
    
    // Load extraction data
    const content = await fs.readFile(extractionPath, 'utf-8');
    const extraction = JSON.parse(content);
    
    // Load overrides if present
    const overrides: Record<string, any> = overridesPath ? JSON.parse(await fs.readFile(overridesPath, 'utf-8')) : {};

    const functions = extraction.functions || [];
    const results: any[] = [];
    const stats: Record<string, number> = {
        total: functions.length,
        classified: 0,
        unclassified: 0
    };

    console.log(`🔍 Classifying ${functions.length} functions...`);

    for (const func of functions) {
        // Check for manual override
        if (overrides[func.name]) {
            results.push({
                function: func.name,
                omc_room: overrides[func.name].room,
                confidence: "manual",
                match_count: 0,
                training_value_score: overrides[func.name].score || 100,
                manual_override: true,
                override_reason: overrides[func.name].reason || "Manual override"
            });
            stats.classified++;
            continue;
        }

        const classification = classifyFunction(func.name, func.snippet);
        results.push(classification);
        
        if (classification.omc_room !== "UNCLASSIFIED") {
            stats.classified++;
        } else {
            stats.unclassified++;
        }
    }

    // Wrap in final report structure
    const report = {
        timestamp: new Date().toISOString(),
        source_extraction: path.basename(extractionPath),
        stats,
        classifications: results
    };

    const outputPath = extractionPath.replace(/\.json$/, '_classified.json');
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));

    console.log("\n📊 CLASSIFICATION SUMMARY");
    console.log(`   - Total:        ${stats.total}`);
    console.log(`   - Classified:   ${stats.classified} (${((stats.classified/stats.total)*100).toFixed(1)}%)`);
    console.log(`   - Unclassified: ${stats.unclassified}`);
    console.log(`\n✅ Results saved to: ${outputPath}`);

    if (stats.unclassified > 0 && !bestEffort) {
        console.warn("\n⚠️ WARNING: Some items remain unclassified. Review output or use --best-effort.");
    }
}

// CLI setup
const program = new Command();
program
    .name("omc-classifier")
    .description("OMC Room Classifier for Circadian Training Pipelines")
    .argument("<extraction.json>", "Input extraction JSON")
    .argument("[overrides.json]", "Optional overrides JSON")
    .option("--best-effort", "Continue even with unclassified items")
    .action(async (extractionPath, overridesPath, options) => {
        try {
            await classifyExtraction(extractionPath, overridesPath, options.bestEffort);
        } catch (error: any) {
            console.error(`\n🔴 FATAL ERROR: ${error.message}`);
            process.exit(1);
        }
    });

program.parse();