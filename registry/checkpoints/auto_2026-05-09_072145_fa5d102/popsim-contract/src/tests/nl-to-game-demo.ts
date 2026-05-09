/**
 * @popsim/contract — NL to Contract Integration Test
 * Demonstrates the full pipeline: Natural Language → Contract → Asset Generation
 */

import { translator } from '../lib/nl-to-game/nl-to-contracts.js';
import { AssetGeneratorSwarm } from '../lib/nl-to-game/asset-generator.js';

async function runDemo() {
    console.log('🎮 PopSim Contract Demo: Natural Language → Playable Roblox Game\n');
    console.log('='.repeat(70));

    // Example natural language prompts
    const prompt = 'Build me a tycoon game where players run a pizza restaurant empire';
    
    console.log(`\n📝 INPUT PROMPT: "${prompt}"\n`);

    // Step 1: Translate NL to Contract
    console.log('⚙️  Step 1: Translating natural language to contract...');
    const result = await translator.generateContract(prompt, {
        gate: 'SAFE',
    });

    if (!result.success || !result.contract) {
        console.log('❌ Contract generation failed');
        return;
    }

    console.log('✅ Contract generated successfully!');
    console.log(`   - Template: ${result.templateUsed?.name}`);
    console.log(`   - Confidence: ${(result.confidenceScore * 100).toFixed(0)}%`);

    // Step 2: Execute Asset Generation Swarm
    console.log('\n⚙️  Step 2: Executing asset generation swarm...');
    const swarm = new AssetGeneratorSwarm(result.contract);
    const generationResult = await swarm.execute();

    console.log(`\n📦 Asset Generation Results:`);
    console.log(`   - Total modules: ${generationResult.totalModules}`);
    console.log(`   - Completed: ${generationResult.completedModules}`);
    console.log(`   - Execution time: ${generationResult.executionTimeMs}ms`);

    if (generationResult.assets.length > 0) {
        console.log('\n📄 Generated Assets:');
        generationResult.assets.forEach(asset => {
            console.log(`   ✅ ${asset.moduleName} (${asset.assetType})`);
        });

        // Show preview of first asset
        const firstAsset = generationResult.assets[0];
        console.log(`\n📋 Code Preview (${firstAsset.moduleName}):`);
        console.log('   ' + '-'.repeat(60));
        const preview = firstAsset.content.split('\n').slice(0, 10).join('\n   ');
        console.log(preview);
        console.log('   ' + '-'.repeat(60));
    }

    console.log('\n✨ Demo complete! Ready to harden the bridge. 🚀\n');
}

// Run the demo
runDemo().catch(console.error);
