# Graph Report - .  (2026-04-15)

## Corpus Check
- 3859 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 914 nodes · 875 edges · 241 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 195 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `MonitoringDashboard` - 17 edges
2. `PerformanceOptimizer` - 12 edges
3. `SuperbulletTestSuite` - 10 edges
4. `SocialKnowledgeClient` - 9 edges
5. `TrainingContractExecutor` - 9 edges
6. `DorkEngine` - 9 edges
7. `SpectraMappingService` - 8 edges
8. `AgentRegistry` - 7 edges
9. `GoldStandardIngestor` - 7 edges
10. `main()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Initialize()` --calls--> `createSpawnLocation()`  [INFERRED]
  packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/d3f1e7b2-9c4f-4a6d-8b9a-2f5f0e8c9b2a/GothicCyberMetropolis.lua → packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/8b1f5c2e-3d7e-4f6b-9b5d-2e1b5c3f8a9d/GothicCyberMetropolis.lua
- `main()` --calls--> `createInformantServer()`  [INFERRED]
  src/memory-vault/mcp-server.ts → src/informant/mcp-server.ts
- `Initialize()` --calls--> `onPlayerTouched()`  [INFERRED]
  packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/d5f3b9c7-8e4b-4e2e-9d3a-3f7e8c2d9b1f/TagGameMechanics.lua → packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/8b1f5c2e-3d7e-4f6b-9b5d-2e1b5c3f8a9d/TagGameMechanics.lua
- `Initialize()` --calls--> `createMetropolis()`  [INFERRED]
  packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/d5f3b9c7-8e4b-4e2e-9d3a-3f7e8c2d9b1f/TagGameMechanics.lua → packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/d3f1e7b2-9c4f-4a6d-8b9a-2f5f0e8c9b2a/TagGameMechanics.lua
- `onPlayerTouched()` --calls--> `tagPlayer()`  [INFERRED]
  packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/8b1f5c2e-3d7e-4f6b-9b5d-2e1b5c3f8a9d/TagGameMechanics.lua → packs/roblox-game-automator/AI-MCP-PLUGIN-Creations/d3f1e7b2-9c4f-4a6d-8b9a-2f5f0e8c9b2a/TagGameMechanics.lua

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (6): AuditLogger, AuditLogger, getStream(), writeAuditRecord(), consumeSession(), getSession()

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (10): applyAtmosphereSettings(), AtmosphereManager.Cleanup(), AtmosphereManager.Initialize(), AtmosphereManager.resetToDefault(), AtmosphereManager.setAmbientColor(), AtmosphereManager.setFog(), AtmosphereManager.setLightingColor(), createAtmosphere() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (3): sanitizeText(), SocialKnowledgeClient, validateSearchQuery()

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (2): PerformanceCache, PerformanceOptimizer

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (12): DorkEngine, DorkTemplate, Intent, main(), Search intent classification, Classify search intent from query, Extract target domain from query, Build optimized Google dorks (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (1): MonitoringDashboard

### Community 7 - "Community 7"
Cohesion: 0.26
Nodes (13): cosine(), dot(), eye(), heatKernel(), jacobi(), l2(), main(), matAdd() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (3): AgentRegistry, DomainDetector, ManifestBuilder

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (10): canDash(), createBuilding(), createMetropolis(), dash(), Initialize(), OnInputBegan(), onPlayerAdded(), onPlayerTouched() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.19
Nodes (6): canDash(), dashPlayer(), TagMechanics.AttemptTag(), TagMechanics.Initialize(), TagMechanics:TagPlayer(), tagPlayer()

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (1): SuperbulletTestSuite

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (2): RepairShopService, ResonanceValidator

### Community 14 - "Community 14"
Cohesion: 0.31
Nodes (1): TrainingContractExecutor

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.28
Nodes (3): applyItVisuals(), onItPlayerUpdated(), removeItVisuals()

### Community 17 - "Community 17"
Cohesion: 0.42
Nodes (1): SpectraMappingService

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (2): SignageManager.displaySign(), SignageManager.refreshAllSigns()

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (3): hydrateFromDisk(), loadPackageFromDisk(), ProgressTracker

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (3): buildDirectorSystemPrompt(), DirectorRuntime, loadSpecialists()

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (2): EnhancedQuantumSocialAgent, QuantumSocialAdapter

### Community 23 - "Community 23"
Cohesion: 0.43
Nodes (1): GoldStandardIngestor

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (2): buildArch(), StructureGenerator:GenerateCathedral()

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 0.32
Nodes (1): AssetGeneratorSwarm

### Community 29 - "Community 29"
Cohesion: 0.38
Nodes (1): SignatureEngine

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (1): ManifestBuilder

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (2): initialize(), TagGameClient.start()

### Community 33 - "Community 33"
Cohesion: 0.43
Nodes (5): VisualEffectService.applyEffectToPlayer(), VisualEffectService.applyGlobalEffect(), VisualEffectService.initEffect(), VisualEffectService.removeEffectFromPlayer(), VisualEffectService.removeGlobalEffect()

### Community 34 - "Community 34"
Cohesion: 0.38
Nodes (4): dashPlayer(), DashSystem.AttemptDash(), DashSystem.Dash(), DashSystem.Initialize()

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 0.52
Nodes (5): clearHub(), err(), execModule(), loadContract(), log()

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): BaseDomainAgent

### Community 39 - "Community 39"
Cohesion: 0.47
Nodes (1): RepairShopOrchestrator

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 0.6
Nodes (5): createAmbientSound(), createBuilding(), createLighting(), createSpawnLocation(), Initialize()

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 0.47
Nodes (3): savePlayerData(), updateUpgradeCost(), UpgradeSystem:UpgradeFeature()

### Community 45 - "Community 45"
Cohesion: 0.47
Nodes (3): applyItVisuals(), onItPlayerUpdated(), removeItVisuals()

### Community 46 - "Community 46"
Cohesion: 0.4
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 0.53
Nodes (4): DeliveryAgent.Deploy(), DeliveryAgent.RequestGame(), DeliveryAgent.WaitForReady(), log()

### Community 48 - "Community 48"
Cohesion: 0.47
Nodes (1): NLToContractTranslator

### Community 49 - "Community 49"
Cohesion: 0.4
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): GovernanceOrchestrator

### Community 51 - "Community 51"
Cohesion: 0.8
Nodes (4): drainDirectory(), drainUrl(), harvest(), processDna()

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 0.6
Nodes (3): createInformantServer(), createMemoryVaultServer(), main()

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (2): CreateAmbientSoundscape(), Initialize()

### Community 55 - "Community 55"
Cohesion: 0.7
Nodes (4): createAmbientLighting(), createBridge(), createTower(), Initialize()

### Community 56 - "Community 56"
Cohesion: 0.6
Nodes (3): buildArch(), buildTower(), TowerGenerator:GenerateCity()

### Community 57 - "Community 57"
Cohesion: 0.6
Nodes (3): createAmbientSoundscape(), createDroneSound(), Initialize()

### Community 58 - "Community 58"
Cohesion: 0.7
Nodes (4): createGlowEffect(), dash(), onPlayerAdded(), PlayerMechanics:Initialize()

### Community 59 - "Community 59"
Cohesion: 0.6
Nodes (3): createObsidianTower(), createPedestrianUnderpass(), UrbanBlockGenerator:GenerateBlock()

### Community 60 - "Community 60"
Cohesion: 0.7
Nodes (4): addLighting(), createBuilding(), createSpawnLocation(), Initialize()

### Community 61 - "Community 61"
Cohesion: 0.4
Nodes (0): 

### Community 62 - "Community 62"
Cohesion: 0.4
Nodes (0): 

### Community 63 - "Community 63"
Cohesion: 0.7
Nodes (4): addNeonAccents(), createNeonMaterial(), createRainSlickSurface(), RooftopGenerator:GenerateRooftop()

### Community 64 - "Community 64"
Cohesion: 0.5
Nodes (2): createSound(), SynthwaveAmbience:Initialize()

### Community 65 - "Community 65"
Cohesion: 0.7
Nodes (4): applyAmbientLighting(), CityscapeGenerator.generateMetropolis(), createIntricateLayout(), createTower()

### Community 66 - "Community 66"
Cohesion: 0.6
Nodes (3): ContractService:GetPolicy(), ContractService:Validate(), request()

### Community 67 - "Community 67"
Cohesion: 0.7
Nodes (4): embedAndUpsert(), getEmbedding(), main(), readDocFiles()

### Community 68 - "Community 68"
Cohesion: 0.4
Nodes (0): 

### Community 69 - "Community 69"
Cohesion: 0.4
Nodes (0): 

### Community 70 - "Community 70"
Cohesion: 0.4
Nodes (0): 

### Community 71 - "Community 71"
Cohesion: 0.4
Nodes (0): 

### Community 72 - "Community 72"
Cohesion: 0.4
Nodes (0): 

### Community 73 - "Community 73"
Cohesion: 0.5
Nodes (1): ResonanceValidator

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (0): 

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (1): SurgicalAssemblyEngine

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (1): SyntheticFracturer

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (0): 

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (3): main(), Generate optimized Google dorks, smart_dork()

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (0): 

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (2): BuildingConstructor.AddLighting(), BuildingConstructor.ConstructBuilding()

### Community 81 - "Community 81"
Cohesion: 0.5
Nodes (0): 

### Community 82 - "Community 82"
Cohesion: 0.5
Nodes (0): 

### Community 83 - "Community 83"
Cohesion: 0.83
Nodes (3): addBioluminescence(), CoralStructureGenerator.generateCoralStructure(), createCoralPart()

### Community 84 - "Community 84"
Cohesion: 0.5
Nodes (0): 

### Community 85 - "Community 85"
Cohesion: 0.83
Nodes (3): applySwimPhysics(), isUnderwater(), onUpdate()

### Community 86 - "Community 86"
Cohesion: 0.5
Nodes (0): 

### Community 87 - "Community 87"
Cohesion: 0.5
Nodes (0): 

### Community 88 - "Community 88"
Cohesion: 0.83
Nodes (3): createBuilding(), createSpawnLocation(), Initialize()

### Community 89 - "Community 89"
Cohesion: 0.5
Nodes (0): 

### Community 90 - "Community 90"
Cohesion: 0.83
Nodes (3): embed(), main(), sha1()

### Community 91 - "Community 91"
Cohesion: 0.5
Nodes (0): 

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (0): 

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (0): 

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (1): QuantumSocialAdapter

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (1): PolicyEngine

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (1): SocialKnowledgeClient

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (0): 

### Community 98 - "Community 98"
Cohesion: 0.67
Nodes (2): PerformanceCache, PerformanceOptimizer

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (2): parseArgs(), runCovenant()

### Community 100 - "Community 100"
Cohesion: 0.67
Nodes (1): EVE v1 GSI Gate — OMC Bridge 2 Reads JSON from stdin, runs TriadGAT diffusion_lo

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (0): 

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (0): 

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (2): CityLayoutGenerator.CreateBuilding(), CityLayoutGenerator.Initialize()

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (2): createAmbientSound(), Initialize()

### Community 105 - "Community 105"
Cohesion: 0.67
Nodes (0): 

### Community 106 - "Community 106"
Cohesion: 0.67
Nodes (0): 

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (2): createDroneSound(), initializeDroneSoundscape()

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (0): 

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (0): 

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (2): classifyExtraction(), classifyFunction()

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (2): computePCA(), main()

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (2): print(), verifyHardening()

### Community 113 - "Community 113"
Cohesion: 1.0
Nodes (1): director_launch.py  —  Director Agent v0 Smoke Test ────────────────────────────

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (1): AgentRegistry

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (1): DomainDetector

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (1): GovernanceOrchestrator

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (1): PolicyEngine

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (1): RepairShopService

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (1): SignatureEngine

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (1): SpectraMappingService

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (0): 

### Community 122 - "Community 122"
Cohesion: 1.0
Nodes (0): 

### Community 123 - "Community 123"
Cohesion: 1.0
Nodes (0): 

### Community 124 - "Community 124"
Cohesion: 1.0
Nodes (0): 

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): RepairShopOrchestrator

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): ResonanceValidator

### Community 127 - "Community 127"
Cohesion: 1.0
Nodes (0): 

### Community 128 - "Community 128"
Cohesion: 1.0
Nodes (1): SurgicalAssemblyEngine

### Community 129 - "Community 129"
Cohesion: 1.0
Nodes (1): SyntheticFracturer

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (0): 

### Community 131 - "Community 131"
Cohesion: 1.0
Nodes (0): 

### Community 132 - "Community 132"
Cohesion: 1.0
Nodes (1): TrainingContractExecutor

### Community 133 - "Community 133"
Cohesion: 1.0
Nodes (1): MonitoringDashboard

### Community 134 - "Community 134"
Cohesion: 1.0
Nodes (0): 

### Community 135 - "Community 135"
Cohesion: 1.0
Nodes (0): 

### Community 136 - "Community 136"
Cohesion: 1.0
Nodes (0): 

### Community 137 - "Community 137"
Cohesion: 1.0
Nodes (0): 

### Community 138 - "Community 138"
Cohesion: 1.0
Nodes (0): 

### Community 139 - "Community 139"
Cohesion: 1.0
Nodes (0): 

### Community 140 - "Community 140"
Cohesion: 1.0
Nodes (0): 

### Community 141 - "Community 141"
Cohesion: 1.0
Nodes (0): 

### Community 142 - "Community 142"
Cohesion: 1.0
Nodes (0): 

### Community 143 - "Community 143"
Cohesion: 1.0
Nodes (0): 

### Community 144 - "Community 144"
Cohesion: 1.0
Nodes (0): 

### Community 145 - "Community 145"
Cohesion: 1.0
Nodes (0): 

### Community 146 - "Community 146"
Cohesion: 1.0
Nodes (0): 

### Community 147 - "Community 147"
Cohesion: 1.0
Nodes (0): 

### Community 148 - "Community 148"
Cohesion: 1.0
Nodes (0): 

### Community 149 - "Community 149"
Cohesion: 1.0
Nodes (0): 

### Community 150 - "Community 150"
Cohesion: 1.0
Nodes (0): 

### Community 151 - "Community 151"
Cohesion: 1.0
Nodes (0): 

### Community 152 - "Community 152"
Cohesion: 1.0
Nodes (0): 

### Community 153 - "Community 153"
Cohesion: 1.0
Nodes (0): 

### Community 154 - "Community 154"
Cohesion: 1.0
Nodes (0): 

### Community 155 - "Community 155"
Cohesion: 1.0
Nodes (0): 

### Community 156 - "Community 156"
Cohesion: 1.0
Nodes (0): 

### Community 157 - "Community 157"
Cohesion: 1.0
Nodes (0): 

### Community 158 - "Community 158"
Cohesion: 1.0
Nodes (0): 

### Community 159 - "Community 159"
Cohesion: 1.0
Nodes (0): 

### Community 160 - "Community 160"
Cohesion: 1.0
Nodes (0): 

### Community 161 - "Community 161"
Cohesion: 1.0
Nodes (0): 

### Community 162 - "Community 162"
Cohesion: 1.0
Nodes (0): 

### Community 163 - "Community 163"
Cohesion: 1.0
Nodes (0): 

### Community 164 - "Community 164"
Cohesion: 1.0
Nodes (0): 

### Community 165 - "Community 165"
Cohesion: 1.0
Nodes (0): 

### Community 166 - "Community 166"
Cohesion: 1.0
Nodes (0): 

### Community 167 - "Community 167"
Cohesion: 1.0
Nodes (0): 

### Community 168 - "Community 168"
Cohesion: 1.0
Nodes (0): 

### Community 169 - "Community 169"
Cohesion: 1.0
Nodes (0): 

### Community 170 - "Community 170"
Cohesion: 1.0
Nodes (0): 

### Community 171 - "Community 171"
Cohesion: 1.0
Nodes (0): 

### Community 172 - "Community 172"
Cohesion: 1.0
Nodes (0): 

### Community 173 - "Community 173"
Cohesion: 1.0
Nodes (0): 

### Community 174 - "Community 174"
Cohesion: 1.0
Nodes (0): 

### Community 175 - "Community 175"
Cohesion: 1.0
Nodes (0): 

### Community 176 - "Community 176"
Cohesion: 1.0
Nodes (0): 

### Community 177 - "Community 177"
Cohesion: 1.0
Nodes (0): 

### Community 178 - "Community 178"
Cohesion: 1.0
Nodes (0): 

### Community 179 - "Community 179"
Cohesion: 1.0
Nodes (0): 

### Community 180 - "Community 180"
Cohesion: 1.0
Nodes (0): 

### Community 181 - "Community 181"
Cohesion: 1.0
Nodes (0): 

### Community 182 - "Community 182"
Cohesion: 1.0
Nodes (0): 

### Community 183 - "Community 183"
Cohesion: 1.0
Nodes (0): 

### Community 184 - "Community 184"
Cohesion: 1.0
Nodes (0): 

### Community 185 - "Community 185"
Cohesion: 1.0
Nodes (0): 

### Community 186 - "Community 186"
Cohesion: 1.0
Nodes (0): 

### Community 187 - "Community 187"
Cohesion: 1.0
Nodes (0): 

### Community 188 - "Community 188"
Cohesion: 1.0
Nodes (0): 

### Community 189 - "Community 189"
Cohesion: 1.0
Nodes (0): 

### Community 190 - "Community 190"
Cohesion: 1.0
Nodes (0): 

### Community 191 - "Community 191"
Cohesion: 1.0
Nodes (0): 

### Community 192 - "Community 192"
Cohesion: 1.0
Nodes (0): 

### Community 193 - "Community 193"
Cohesion: 1.0
Nodes (0): 

### Community 194 - "Community 194"
Cohesion: 1.0
Nodes (0): 

### Community 195 - "Community 195"
Cohesion: 1.0
Nodes (0): 

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (0): 

### Community 197 - "Community 197"
Cohesion: 1.0
Nodes (0): 

### Community 198 - "Community 198"
Cohesion: 1.0
Nodes (0): 

### Community 199 - "Community 199"
Cohesion: 1.0
Nodes (0): 

### Community 200 - "Community 200"
Cohesion: 1.0
Nodes (0): 

### Community 201 - "Community 201"
Cohesion: 1.0
Nodes (0): 

### Community 202 - "Community 202"
Cohesion: 1.0
Nodes (0): 

### Community 203 - "Community 203"
Cohesion: 1.0
Nodes (0): 

### Community 204 - "Community 204"
Cohesion: 1.0
Nodes (0): 

### Community 205 - "Community 205"
Cohesion: 1.0
Nodes (0): 

### Community 206 - "Community 206"
Cohesion: 1.0
Nodes (0): 

### Community 207 - "Community 207"
Cohesion: 1.0
Nodes (0): 

### Community 208 - "Community 208"
Cohesion: 1.0
Nodes (0): 

### Community 209 - "Community 209"
Cohesion: 1.0
Nodes (0): 

### Community 210 - "Community 210"
Cohesion: 1.0
Nodes (0): 

### Community 211 - "Community 211"
Cohesion: 1.0
Nodes (0): 

### Community 212 - "Community 212"
Cohesion: 1.0
Nodes (0): 

### Community 213 - "Community 213"
Cohesion: 1.0
Nodes (0): 

### Community 214 - "Community 214"
Cohesion: 1.0
Nodes (0): 

### Community 215 - "Community 215"
Cohesion: 1.0
Nodes (0): 

### Community 216 - "Community 216"
Cohesion: 1.0
Nodes (0): 

### Community 217 - "Community 217"
Cohesion: 1.0
Nodes (0): 

### Community 218 - "Community 218"
Cohesion: 1.0
Nodes (0): 

### Community 219 - "Community 219"
Cohesion: 1.0
Nodes (0): 

### Community 220 - "Community 220"
Cohesion: 1.0
Nodes (0): 

### Community 221 - "Community 221"
Cohesion: 1.0
Nodes (0): 

### Community 222 - "Community 222"
Cohesion: 1.0
Nodes (0): 

### Community 223 - "Community 223"
Cohesion: 1.0
Nodes (0): 

### Community 224 - "Community 224"
Cohesion: 1.0
Nodes (0): 

### Community 225 - "Community 225"
Cohesion: 1.0
Nodes (0): 

### Community 226 - "Community 226"
Cohesion: 1.0
Nodes (0): 

### Community 227 - "Community 227"
Cohesion: 1.0
Nodes (0): 

### Community 228 - "Community 228"
Cohesion: 1.0
Nodes (0): 

### Community 229 - "Community 229"
Cohesion: 1.0
Nodes (0): 

### Community 230 - "Community 230"
Cohesion: 1.0
Nodes (0): 

### Community 231 - "Community 231"
Cohesion: 1.0
Nodes (0): 

### Community 232 - "Community 232"
Cohesion: 1.0
Nodes (0): 

### Community 233 - "Community 233"
Cohesion: 1.0
Nodes (0): 

### Community 234 - "Community 234"
Cohesion: 1.0
Nodes (0): 

### Community 235 - "Community 235"
Cohesion: 1.0
Nodes (0): 

### Community 236 - "Community 236"
Cohesion: 1.0
Nodes (0): 

### Community 237 - "Community 237"
Cohesion: 1.0
Nodes (0): 

### Community 238 - "Community 238"
Cohesion: 1.0
Nodes (0): 

### Community 239 - "Community 239"
Cohesion: 1.0
Nodes (0): 

### Community 240 - "Community 240"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **29 isolated node(s):** `director_launch.py  —  Director Agent v0 Smoke Test ────────────────────────────`, `QuantumSocialAdapter`, `AgentRegistry`, `AuditLogger`, `DomainDetector` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 113`** (2 nodes): `director_launch.py`, `director_launch.py  —  Director Agent v0 Smoke Test ────────────────────────────`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `agent-registry.d.ts`, `AgentRegistry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (2 nodes): `domain-detector.d.ts`, `DomainDetector`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `orchestrator.d.ts`, `GovernanceOrchestrator`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (2 nodes): `policy-engine.d.ts`, `PolicyEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (2 nodes): `repair-shop.d.ts`, `RepairShopService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (2 nodes): `signature-engine.d.ts`, `SignatureEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (2 nodes): `spectra-mapping.d.ts`, `SpectraMappingService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (2 nodes): `roblox-domain.ts`, `training-protocol.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (2 nodes): `export-json-schema.ts`, `sortKeys()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (2 nodes): `heuristic-tars-audit.ts`, `runHeuristicAudit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (2 nodes): `manifest-pizza-repair.ts`, `runRepairCycle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `repair-shop-orchestrator.d.ts`, `RepairShopOrchestrator`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `resonance-validator.d.ts`, `ResonanceValidator`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `state-refiner.ts`, `ensureDirs()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (2 nodes): `surgical-assembly-engine.d.ts`, `SurgicalAssemblyEngine`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 129`** (2 nodes): `synthetic-fracturer.d.ts`, `SyntheticFracturer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (2 nodes): `trace-demo.ts`, `runDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (2 nodes): `v1-dry-run.ts`, `executeDryRun()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (2 nodes): `training-contract.d.ts`, `TrainingContractExecutor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (2 nodes): `monitoring-dashboard.d.ts`, `MonitoringDashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 134`** (2 nodes): `PlayerAbilities.lua.lua`, `PlayerAbilities:Initialize()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (2 nodes): `AmbientDroneEngine.lua`, `AmbientDroneEngine.Initialize()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 137`** (2 nodes): `director-demo.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (2 nodes): `hotfix_pusher.ts`, `runHotfix()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 139`** (2 nodes): `nl-to-game-demo.ts`, `runDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 140`** (2 nodes): `pusher.ts`, `pushToBridge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 141`** (2 nodes): `verify_spectra_logic.ts`, `testSpectraLogic()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 142`** (2 nodes): `Marsh_Messy_Drop.lua`, `CanonicalModule.Init()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (2 nodes): `test_slop.lua`, `CanonicalModule.Init()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (2 nodes): `forensic-extractor.py`, `extract_lua()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (1 nodes): `AMEM_HONEST_ARCHITECTURE.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 146`** (1 nodes): `PizzaPlace_GameService.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (1 nodes): `PizzaPlace_Main.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (1 nodes): `PizzaPlace_GameService_SHATTERED.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (1 nodes): `agent-sdk.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (1 nodes): `base-domain-agent.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 151`** (1 nodes): `task.schema.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 152`** (1 nodes): `task.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 153`** (1 nodes): `knowledge.types.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 154`** (1 nodes): `index.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 155`** (1 nodes): `repair-shop-schemas.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 156`** (1 nodes): `repair-shop-schemas.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 157`** (1 nodes): `training-protocol.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (1 nodes): `export-json-schema.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 159`** (1 nodes): `heuristic-tars-audit.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 160`** (1 nodes): `ingest-canonical-library.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 161`** (1 nodes): `manifest-pizza-repair.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (1 nodes): `metropolis-bridge.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 163`** (1 nodes): `metropolis-bridge.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 164`** (1 nodes): `sentry-watcher.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 165`** (1 nodes): `spectral-heatmap-lab.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 166`** (1 nodes): `state-refiner.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 167`** (1 nodes): `trace-demo.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 168`** (1 nodes): `v1-dry-run.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 169`** (1 nodes): `validate-registry.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 170`** (1 nodes): `validate-registry.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 171`** (1 nodes): `vampire-ingestor.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 172`** (1 nodes): `verify-training-protocol.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 173`** (1 nodes): `verify-training-protocol.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 174`** (1 nodes): `agent-output.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 175`** (1 nodes): `agent-output.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 176`** (1 nodes): `agent-governance.schema.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 177`** (1 nodes): `ai-ops-manager.contract.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 178`** (1 nodes): `contract-data.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 179`** (1 nodes): `specialist.contract.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 180`** (1 nodes): `validate.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 181`** (1 nodes): `agent.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 182`** (1 nodes): `agent.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 183`** (1 nodes): `amem-payload.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 184`** (1 nodes): `amem-payload.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 185`** (1 nodes): `asset.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (1 nodes): `asset.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (1 nodes): `eve-v2.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (1 nodes): `eve-v2.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (1 nodes): `physics-threshold.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 190`** (1 nodes): `physics-threshold.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (1 nodes): `script-audit.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (1 nodes): `script-audit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (1 nodes): `script-manifestation.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 194`** (1 nodes): `script-manifestation.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 195`** (1 nodes): `skill.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (1 nodes): `skill.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 197`** (1 nodes): `specialist.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (1 nodes): `specialist.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 199`** (1 nodes): `task.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 200`** (1 nodes): `task.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 201`** (1 nodes): `validate-manifestation.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 202`** (1 nodes): `validate-manifestation.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 203`** (1 nodes): `mcp-server.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 204`** (1 nodes): `runner.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 205`** (1 nodes): `governance_handoff.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 206`** (1 nodes): `CarnivalLayout.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 207`** (1 nodes): `bridge-server.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 208`** (1 nodes): `core-schemas.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 209`** (1 nodes): `crypto-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 210`** (1 nodes): `crypto-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 211`** (1 nodes): `flight-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 212`** (1 nodes): `flight-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 213`** (1 nodes): `generic-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 214`** (1 nodes): `market-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 215`** (1 nodes): `market-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 216`** (1 nodes): `popsim-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 217`** (1 nodes): `population-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 218`** (1 nodes): `racing-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 219`** (1 nodes): `racing-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 220`** (1 nodes): `roblox-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 221`** (1 nodes): `swarm-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 222`** (1 nodes): `swarm-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 223`** (1 nodes): `tycoon-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 224`** (1 nodes): `tycoon-domain.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 225`** (1 nodes): `schemas.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 226`** (1 nodes): `schemas.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 227`** (1 nodes): `economic_validation.test.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 228`** (1 nodes): `economic_validation.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 229`** (1 nodes): `types.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 230`** (1 nodes): `validate-contract.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 231`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 232`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 233`** (1 nodes): `director-contract.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 234`** (1 nodes): `sovereign-scientist-domain.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 235`** (1 nodes): `metropolis_injector.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 236`** (1 nodes): `escrow.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (1 nodes): `schema-validator.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 238`** (1 nodes): `adventure-tag.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 239`** (1 nodes): `pizza-superbullet.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 240`** (1 nodes): `space-tycoon-obby.lua`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `director_launch.py  —  Director Agent v0 Smoke Test ────────────────────────────`, `QuantumSocialAdapter`, `AgentRegistry` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._