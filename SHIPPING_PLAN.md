# Open Model-Contracts — Shipping Plan

**Goal:** Ship 1.0 to GitHub in **48 hours** (by Feb 27, 2026)

**Status:** Alpha → 1.0 (minimal viable spec)

---

## Hard Stop Finish Line

### ✅ What's Already Done (80%)

1. **Core spec docs** (6 files, ~47KB)
   - `spec/OVERVIEW.md` (5.7KB)
   - `spec/CONTRACTS.md` (6.3KB)
   - `spec/GATES.md` (3.9KB)
   - `spec/ADMISSION.md` (3.3KB)
   - `spec/GOVERNANCE.md` (12KB)
   - `spec/DREAM_CYCLE.md` (16KB)

2. **Domicile governance bundle** relocated to `spec/domicile-governance/`

3. **Package structure** (`package.json`, `tsconfig.json`, `dist/`)

4. **License** (MIT)

### ❌ What's Missing (20%)

1. **One working reference implementation** (not 10 half-finished ones)
2. **spec/REFERENCE_IMPLEMENTATION.md** (points to example code)
3. **GitHub repo** (push it!)
4. **Version tag** (v1.0.0)

---

## The 48-Hour Plan

### Hour 0-8: Extract ONE Reference Implementation

**From domicile_live, extract:**
- The AI Operations Manager contract (`ai-ops-manager.contract.ts`)
- A minimal executor (30 lines max)
- A test case (10 lines)

**Don't extract:**
- The FSM (too complex)
- The Pi5 orchestration (too specific)
- The OpenClaw integration (not spec-level)

**Output:**
```
examples/
└── ai-operations-manager/
    ├── contract.ts          # Zod schema
    ├── executor.ts          # Minimal execution example
    ├── test.ts              # One test case
    └── README.md            # How to run
```

### Hour 8-16: Write spec/REFERENCE_IMPLEMENTATION.md

**Template:**
```markdown
# Reference Implementation

This spec is model-agnostic and sector-agnostic. Here's one reference implementation:

## AI Operations Manager Contract

A strategic AI operations management contract that demonstrates:
- Zod schema validation
- SAFE/ARMED gate enforcement
- Discriminated union result types
- Covenant trust scoring integration

See: `examples/ai-operations-manager/`

## Running the Example

[3 commands to run it]

## Extending This

[How to adapt this pattern to other domains]
```

### Hour 16-24: Clean Up & Version

1. Review all 6 spec docs for consistency
2. Update `package.json` → version: "1.0.0"
3. Write `CHANGELOG.md` (what's new in 1.0)
4. Update main `README.md` with "Status: **1.0** - Shipped"

### Hour 24-32: Push to GitHub

1. Create GitHub repo: `open-model-contracts`
2. Push all files
3. Tag v1.0.0
4. Write GitHub Release notes

### Hour 32-48: Announce & Lock

1. Tweet/blog about it
2. **Lock the spec** — No new features for 1.0.x
3. Open issues for 2.0 wishlist
4. **Go back to domicile_live** (the messy workshop) for experimentation

---

## What Does NOT Ship in 1.0

**These stay in domicile_live (your workshop):**
- Operation Hydra FSM engine
- Pi5 OpenClaw integration
- Multi-agent coordination
- Circadian dream cycle implementation
- React dashboard
- FastAPI backend
- All the robust infrastructure we just built

**Why?**
- They're reference implementations (workshop experiments)
- Not part of the spec
- Can evolve separately
- domicile_live = your R&D lab (messy is OK)

---

## After 1.0 Ships

### domicile_live's New Role

**It becomes:**
- Your testing ground for open-model-contracts patterns
- A "blessed reference implementation" (but not THE spec)
- A place to prototype 2.0 features

**It does NOT need to:**
- Be clean
- Be on GitHub
- Have a release schedule
- Ship to customers

### open-model-contracts 2.0 Roadmap

**Only add to spec if:**
- ✅ Proven in domicile_live
- ✅ Generalizable across sectors
- ✅ Simple to explain
- ✅ Backward compatible

**Examples of 2.0 features:**
- Multi-agent coordination contracts
- Streaming execution contracts
- Constitutional amendment schemas
- Trust scoring standardization

---

## Success Criteria for 1.0

1. ✅ 6 spec docs published
2. ✅ 1 reference implementation that runs
3. ✅ GitHub repo with v1.0.0 tag
4. ✅ MIT license
5. ✅ README explains what/why/how
6. ✅ Other people can fork and extend

**That's it. Nothing more.**

---

## Your New Workflow (Post-1.0)

```
1. Experiment in domicile_live (messy workshop)
   ↓
2. Extract proven patterns
   ↓
3. Propose for open-model-contracts 2.0
   ↓
4. Ship when ready (not before)
```

**Separate the spec from the implementation.**

**Ship the spec. Keep iterating on implementations.**

---

**Deadline:** Feb 27, 2026, 11:59 PM
**Accountability:** Post v1.0.0 GitHub link or you owe me a beer 🍺
