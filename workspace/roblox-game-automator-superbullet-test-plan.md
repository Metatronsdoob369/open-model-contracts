# Three-phase validation comparing baseline repair vs MiroFish spatial-context-assisted repair, followed by full NL generation.

 ## Test Structure

 ```
 PHASE 1: Repair Baseline (No Context)
 ├── variant: syntax-error-comments
 ├── variant: missing-end-statement
 ├── variant: deprecated-api
 ├── variant: undefined-variable
 └── variant: malformed-cframe

 PHASE 2: MiroFish Repair (3072-D Spatial Context)
 ├── Same variants as Phase 1
 └── Enhancement: Heat map showing code position in quality space

 PHASE 3: NL Generation
 └── Full pipeline: Prompt → Director-01 → Specialists → Assets
 ```

 ## Broken Variants

 | Variant | Fault | Expected Fix |
 |---------|-------|--------------|
 | `syntax-error-comments` | `//` instead of `--` | Replace with valid Luau comments |
 | `missing-end-statement` | Missing `end` keyword | Add missing `end` |
 | `deprecated-api` | Uses `wait()` instead of `task.wait()` | Replace with modern API |
 | `undefined-variable` | References `undefinedVariable` | Define or replace variable |
 | `malformed-cframe` | Mismatched parentheses | Fix CFrame constructor |

 ## File Locations

 - **Canonical Source:** `/src/canonical/partner_superbullet.lua`
 - **Broken Variants:** `/workspace/broken-variants/*.lua`
 - **Test Results:** `/workspace/test-results/<contractId>/`
 - **Refrag 3072 Viz:** `/workspace/refrag-3072-site/` (Three.js spatial map)

 ## Running the Test

 ```bash
 cd packs/roblox-game-automator

 # Start infrastructure
 redis-server &
 npm run dev # Bridge on port 3099

 # Run test suite
 cd src/tests
 npx tsx superbullet-test-suite.ts
 ```

 ## Expected Output

 ```
 🧪 Superbullet Test Suite Initialized
 📄 Canonical code: 65 lines

 🔧 PHASE 1: Baseline Repair (No Spatial Context)
 ============================================================

 📝 Testing: syntax-error-comments
 Fault: Uses // instead of -- for comments (invalid Luau)
 ✅ Result: FIXED (1245ms)

 ...

 🌌 PHASE 2: MiroFish Repair (3072-D Spatial Context)
 ============================================================

 📝 Testing: syntax-error-comments
 Enhancement: 3072-dim embedding + spatial heat map
 ✅ Result: FIXED (892ms)
 📊 Spatial: 3 canonical neighbors

 ...

 ╔════════════════════════════════════════════════════════════╗
 ║ SUPERBULLET TEST SUITE — FINAL REPORT ║
 ╚════════════════════════════════════════════════════════════╝

 📊 REPAIR COMPARISON (Baseline vs MiroFish Spatial Context)
 ────────────────────────────────────────────────────────────
 Variant | Baseline | MiroFish | Improvement
 ────────────────────────────────────────────────────────────
 syntax-error-comments | ✅ | ✅ | —
 missing-end-statement | ❌ | ✅ | ⬆️ FIXED
 deprecated-api | ✅ | ✅ | —
 undefined-variable | ❌ | ✅ | ⬆️ FIXED
 malformed-cframe | ✅ | ✅ | —
 ```

 ## MiroFish Spatial Context

 The 3072-dimensional embedding creates a "code quality space" where:
 - Each code snippet is a point in 3072-D space
 - Canonical (known-good) code forms clusters
 - Broken code appears as outliers
 - Repair agent receives heat map showing distance to nearest canonical cluster

 This replaces fine-tuning with architectural context — the novel contribution of OMC.

 ## Integration Points

 1. **Bridge Server** needs `/v1/repair` endpoint (accepts code + faultType + useMiroFish flag)
 2. **Qdrant** needs 3072-dim vectors indexed for canonical code
 3. **Refrag Site** visualizes spatial map in 3D (Three.js)

 ## Next Steps

 1. Implement `/v1/repair` endpoint in bridge-server.ts
 2. Wire up Qdrant embedding queries
 3. Run test suite
 4. Compare baseline vs MiroFish success rates
 5. Iterate on spatial heat map visualization
