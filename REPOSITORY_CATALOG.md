# REPOSITORY_CATALOG — Open Model-Contracts

**Repository:** open-model-contracts
**Type:** Specification (not implementation)
**Status:** v1.0.0-alpha (shipped)
**License:** MIT
**Last Updated:** 2026-02-26

---

## PHILOSOPHY

**This is a spec, not a framework.**

- Like **OpenAPI** (not Express.js)
- Like **JSON Schema** (not a JSON parser)
- Like **HTTP spec** (not a web server)

**domicile_live** = Reference implementation (your workshop)
**open-model-contracts** = The standard (the law)

---

## DIRECTORY STRUCTURE

```
open-model-contracts/
├── spec/                    # The specification (CANONICAL)
├── examples/                # Reference implementations (PROVE IT WORKS)
├── packages/                # Optional: npm packages for contract helpers
├── docs/                    # User-facing documentation
├── tests/                   # Spec compliance tests
└── governance/              # Meta-governance (how the spec evolves)
```

---

## SPEC/ (CANONICAL LAW)

**Purpose:** The actual specification documents

**Status:** ✅ Shipped in v1.0.0-alpha

### Structure

```
spec/
├── OVERVIEW.md              # What/why/how
├── CONTRACTS.md             # Contract schema specification
├── GATES.md                 # SAFE/ARMED execution model
├── ADMISSION.md             # Tool admission criteria
├── GOVERNANCE.md            # Constitutional governance
├── DREAM_CYCLE.md           # Self-improvement spec
└── domicile-governance/     # Reference governance bundle
    ├── MCP_ADMISSION_CONTRACT.md
    ├── OPENCLAW_ADMISSION_CONTRACT.md
    ├── TERRAFORM_ADMISSION_CONTRACT.md
    ├── N8N_MCP_ADMISSION_AUDIT.md
    └── OPEN_NOTEBOOK_MCP_AFFORDANCES.md
```

### Spec Documents (47KB total)

| File              | Purpose                                    | Lines | Status      |
|-------------------|--------------------------------------------|-------|-------------|
| `OVERVIEW.md`     | Introduction and motivation                | ~150  | ✓ Canonical |
| `CONTRACTS.md`    | Zod schema specification                   | ~200  | ✓ Canonical |
| `GATES.md`        | SAFE/ARMED execution model                 | ~120  | ✓ Canonical |
| `ADMISSION.md`    | 8 MCP admission requirements               | ~100  | ✓ Canonical |
| `GOVERNANCE.md`   | Constitutional governance framework        | ~400  | ✓ Canonical |
| `DREAM_CYCLE.md`  | Self-improvement specification             | ~500  | ✓ Canonical |

**Principle:** Specs are normative. No implementation details.

---

## EXAMPLES/ (PROOF OF CONCEPT)

**Purpose:** Working reference implementations that prove the patterns work

**Status:** ✅ 2 examples shipped in v1.0.0-alpha

### Structure

```
examples/
├── ai-operations-manager/   # Strategic AI ops governance (NEW)
├── safe-recon/              # SAFE/ARMED OSINT tool (EXISTING)
├── basic/                   # Minimal "hello world" contract
├── multi-actor/             # Multi-agent coordination
└── tool-chain/              # Tool chain governance
```

### Reference Implementations

| Example                  | Purpose                               | Lines | Status            |
|--------------------------|---------------------------------------|-------|-------------------|
| `ai-operations-manager/` | Enterprise AI operations contract     | 150   | ✅ Shipped (v1.0) |
| `safe-recon/`            | SAFE/ARMED OSINT gathering            | ~200  | ✅ Shipped (v1.0) |
| `basic/`                 | Minimal contract example              | ~50   | 📋 Planned (v1.1) |
| `multi-actor/`           | Multi-agent coordination pattern      | ~300  | 📋 Planned (v2.0) |
| `tool-chain/`            | Tool chain governance pattern         | ~200  | 📋 Planned (v2.0) |

**Each example must:**
- ✅ Be runnable (not pseudocode)
- ✅ Demonstrate a spec pattern
- ✅ Be ≤300 lines (if longer, it's a framework, not an example)
- ✅ Have a README explaining what it proves

---

## PACKAGES/ (OPTIONAL — NOT IN V1.0)

**Purpose:** npm packages for contract helper utilities

**Status:** 🚧 Not yet implemented (planned for v1.1)

### Proposed Structure

```
packages/
├── core/                    # Core contract utilities
│   ├── schemas/             # Pre-built Zod schemas
│   ├── validators/          # Gate validators
│   └── types/               # TypeScript types
├── adapters/                # Framework adapters
│   ├── openai/              # OpenAI Agents SDK adapter
│   ├── langchain/           # LangChain adapter
│   └── autogen/             # AutoGen adapter
└── tools/                   # CLI tools
    ├── validator/           # Contract validation CLI
    └── codegen/             # Schema code generator
```

### Package Scope (When We Build It)

**@open-model-contracts/core:**
- Pre-built Zod schemas (task contracts, result envelopes)
- Gate validators (SAFE/ARMED enforcement)
- TypeScript types

**@open-model-contracts/adapters:**
- Adapters for popular agent frameworks
- Makes it easy to add contract governance to existing systems

**@open-model-contracts/tools:**
- CLI validator (validate JSON against schemas)
- Code generator (generate TypeScript from contract definitions)

**Principle:** Packages are **helpers**, not the spec. Spec is framework-agnostic.

---

## DOCS/ (USER-FACING)

**Purpose:** User-facing documentation (not the spec itself)

**Status:** 📋 Planned for v1.1

### Proposed Structure

```
docs/
├── getting-started/         # Quick start guides
├── guides/                  # How-to guides
│   ├── writing-contracts.md
│   ├── gate-enforcement.md
│   ├── admission-audits.md
│   └── constitutional-evolution.md
├── adapters/                # Framework integration guides
│   ├── openai.md
│   ├── langchain.md
│   └── autogen.md
├── use-cases/               # Sector-specific guides
│   ├── healthcare.md
│   ├── finance.md
│   ├── legal.md
│   └── devops.md
└── api/                     # API reference (if we ship packages)
```

**Difference from spec/:**
- **spec/** = WHAT (normative)
- **docs/** = HOW (informative)

---

## TESTS/ (COMPLIANCE VALIDATION)

**Purpose:** Test suite that validates implementations comply with spec

**Status:** 📋 Planned for v1.2

### Proposed Structure

```
tests/
├── contracts/               # Contract schema validation tests
├── gates/                   # SAFE/ARMED enforcement tests
├── admission/               # MCP admission audit tests
└── fixtures/                # Test fixtures and mock data
```

**Philosophy:**
- Tests validate **compliance with spec**, not implementation behavior
- Reference implementations (examples/) should pass all tests
- External implementations can run tests to prove compliance

---

## GOVERNANCE/ (META-GOVERNANCE)

**Purpose:** How the spec itself evolves

**Status:** 📋 Planned for v1.1

### Proposed Structure

```
governance/
├── SPEC_EVOLUTION.md        # How spec changes are proposed
├── VERSIONING.md            # Semantic versioning policy
├── COMPATIBILITY.md         # Backward compatibility rules
└── PROPOSALS/               # Spec change proposals (RFC-style)
    ├── 001-streaming-contracts.md
    ├── 002-multi-agent-coordination.md
    └── template.md
```

**Spec Evolution Process:**
1. **Proposal** — Submit RFC to PROPOSALS/
2. **Discussion** — GitHub issue for community feedback
3. **Prototype** — Prove it works in domicile_live or another implementation
4. **Acceptance** — Merge into spec/ with version bump
5. **Deprecation** — Old patterns deprecated but supported for N versions

**Versioning:**
- v1.x.x = Backward compatible additions
- v2.x.x = Breaking changes (with migration guide)
- Implementations can declare which spec version they support

---

## SIZE BREAKDOWN (V1.0.0-ALPHA)

```
Total: ~200KB tracked in git

├── spec/                                47KB  (24%)
│   ├── Core spec docs                   ~30KB
│   └── domicile-governance bundle       ~17KB
├── examples/                            ~80KB  (40%)
│   ├── ai-operations-manager/           ~40KB
│   └── safe-recon/                      ~40KB
├── Root docs/                           ~50KB  (25%)
│   ├── README.md                        ~3KB
│   ├── CHANGELOG.md                     ~2KB
│   ├── SHIPPING_PLAN.md                 ~5KB
│   ├── GITHUB_BABY_STEPS.md             ~10KB
│   └── TWEET.md                         ~3KB
└── Config/                              ~23KB  (11%)
    ├── package.json                     ~1KB
    ├── LICENSE                          ~1KB
    └── Various scripts                  ~21KB

node_modules/: 20MB (on disk, not tracked)
```

**Comparison to domicile_live:**
- domicile_live: 3.4GB (full framework, testing ground)
- open-model-contracts: 200KB (spec only)

**This is correct.** Specs should be tiny.

---

## MONOREPO vs MULTI-REPO

### Current: Single Repo (v1.0)

```
open-model-contracts/
├── spec/
├── examples/
└── ...
```

**Pros:**
- Simple
- Easy to discover
- All in one place

**Cons:**
- Spec changes mix with example changes in git history
- Can't version spec separately from implementations

### Future: Multi-Repo (v2.0+?)

```
open-model-contracts/          (spec only, canonical)
├── spec/
└── governance/

open-model-contracts-examples/ (reference implementations)
├── ai-operations-manager/
├── safe-recon/
└── ...

open-model-contracts-js/       (npm packages)
├── core/
├── adapters/
└── tools/

open-model-contracts-py/       (Python packages)
open-model-contracts-go/       (Go packages)
```

**Decision:** Stay single repo until v2.0. Don't over-engineer.

---

## WHAT BELONGS WHERE (DOMICILE_LIVE VS OPEN-MODEL-CONTRACTS)

### open-model-contracts (Spec Repo)

**Belongs here:**
- ✅ Specification documents (spec/)
- ✅ Minimal reference implementations (examples/)
- ✅ npm packages for contract helpers (packages/, when we build them)
- ✅ Compliance test suite (tests/, when we build it)

**Does NOT belong here:**
- ❌ Full agent runtime (that's domicile_live)
- ❌ Supabase integration (implementation-specific)
- ❌ Pi5 orchestration (implementation-specific)
- ❌ React dashboards (implementation-specific)
- ❌ Your experiments and R&D (domicile_live is your workshop)

### domicile_live (Implementation Repo)

**Belongs there:**
- ✅ Full agent framework (packages/agents, etc.)
- ✅ Production orchestration (FSM, Supabase, Pi5)
- ✅ Experimental features (testing ground)
- ✅ Your custom agents and skills
- ✅ Real-world integrations

**Relation to open-model-contracts:**
- domicile_live **implements** open-model-contracts spec
- Lessons from domicile_live **inform** open-model-contracts 2.0
- open-model-contracts **does not depend** on domicile_live

---

## QUICK NAVIGATION

### Working on the Spec

```bash
cd /Users/joewales/NODE_OUT_Master/open-model-contracts
cd spec/
# Edit CONTRACTS.md, GATES.md, etc.
```

### Adding a Reference Implementation

```bash
cd examples/
mkdir my-new-example
cd my-new-example
# Write contract.ts, executor.ts, test.ts, README.md
```

### Testing an Example

```bash
cd examples/ai-operations-manager
npm install
tsx test.ts
```

### Proposing a Spec Change (v1.1+)

```bash
cd governance/PROPOSALS/
cp template.md 003-my-proposal.md
# Edit proposal, submit PR
```

---

## FILE ORGANIZATION PRINCIPLES

### What Makes a Good Spec File

**spec/ files should be:**
- ✅ Normative (defines MUST/SHOULD/MAY)
- ✅ Framework-agnostic (no "use this library")
- ✅ Example-driven (show schemas, not just prose)
- ✅ Versioned (track breaking changes)

**spec/ files should NOT be:**
- ❌ Tutorials (use docs/ instead)
- ❌ Implementation guides (use docs/ instead)
- ❌ Code (use examples/ instead)

### What Makes a Good Example

**examples/ should be:**
- ✅ Runnable (not pseudocode)
- ✅ Self-contained (≤300 lines)
- ✅ Well-documented (README explains what it proves)
- ✅ Spec-compliant (passes tests/)

**examples/ should NOT be:**
- ❌ Production code (examples are for learning)
- ❌ Framework-specific (unless in examples/adapters/)
- ❌ Feature-complete (show the pattern, not everything)

---

## VERSIONING STRATEGY

### Spec Versions

**v1.0.0-alpha** (CURRENT)
- Core spec shipped
- 2 reference implementations
- Gathering feedback

**v1.0.0** (STABLE)
- Community feedback incorporated
- More reference implementations
- Production-ready

**v1.1.0** (FEATURE RELEASE)
- Add packages/ (npm helpers)
- Add tests/ (compliance suite)
- Add docs/ (user guides)
- Add governance/ (evolution process)

**v2.0.0** (MAJOR RELEASE)
- Multi-agent coordination contracts
- Streaming execution contracts
- Trust scoring standardization
- Breaking changes (with migration guide)

### Backward Compatibility Rules

**Within v1.x.x:**
- ✅ Can add new contract types
- ✅ Can add optional fields
- ✅ Can deprecate (but not remove) patterns
- ❌ Cannot remove contract types
- ❌ Cannot make required fields optional
- ❌ Cannot change schema semantics

**For v2.0.0+:**
- Breaking changes allowed
- Must provide migration guide
- Deprecation warnings in v1.x.x first

---

## COMPARISON TO OTHER SPECS

| Spec               | Purpose                    | Size     | Repo Type  |
|--------------------|----------------------------|----------|------------|
| **OpenAPI**        | API specification          | ~50KB    | Spec only  |
| **JSON Schema**    | JSON validation            | ~30KB    | Spec only  |
| **GraphQL**        | Query language spec        | ~100KB   | Spec only  |
| **OAuth 2.0**      | Authorization framework    | ~200KB   | Spec only  |
| **open-m-c v1.0**  | AI contract governance     | ~200KB   | Spec only  |

**Pattern:**
- Spec repos are **small** (50-200KB)
- Implementations are **large** (MBs-GBs)
- Specs define **WHAT**, implementations define **HOW**

---

## GROWTH TRAJECTORY

### v1.0.0-alpha (NOW)

```
200KB repo
├── 6 spec docs
├── 2 examples
└── Basic docs
```

### v1.1.0 (6 MONTHS)

```
500KB repo
├── 6 spec docs (refined)
├── 5 examples (healthcare, finance, legal added)
├── packages/ (npm helpers)
├── tests/ (compliance suite)
└── docs/ (user guides)
```

### v2.0.0 (12 MONTHS)

```
1MB repo
├── 10 spec docs (multi-agent, streaming, trust scoring)
├── 10 examples (more sectors)
├── packages/ (multi-language support)
├── tests/ (comprehensive)
└── Community contributions
```

**Target:** Stay under 5MB forever. If it grows beyond that, split into multi-repo.

---

## MAINTENANCE COMMANDS

### Check Spec Size

```bash
cd /Users/joewales/NODE_OUT_Master/open-model-contracts
du -sh spec/
wc -l spec/*.md
```

### Validate Examples

```bash
cd examples/ai-operations-manager
tsx test.ts
```

### Check Repo Health

```bash
git log --oneline --graph --all
git ls-files | wc -l
du -sh .git
```

### Find Large Files

```bash
find . -type f -size +100k ! -path "*/node_modules/*"
```

---

## RELATED DOCUMENTS

**In This Repo:**
- `README.md` — Main introduction
- `CHANGELOG.md` — Version history
- `SHIPPING_PLAN.md` — How we shipped v1.0
- `spec/OVERVIEW.md` — Spec introduction

**External:**
- domicile_live: https://github.com/Metatronsdoob369/Domicile
- Your workshop for testing open-model-contracts patterns

---

## PRINCIPLES (NEVER FORGET)

1. **This is a spec, not a framework**
   - Don't build features, define patterns

2. **Model-agnostic, sector-agnostic**
   - Works with GPT, Claude, Llama, whatever
   - Works for healthcare, finance, legal, whatever

3. **Prompts are suggestions. Contracts are law.**
   - The tagline is the philosophy

4. **Ship minimal, evolve based on usage**
   - v1.0 is 200KB. That's correct.

5. **domicile_live informs this, not the other way around**
   - Prototype there, extract here

---

**Last Updated:** 2026-02-26
**Catalog Version:** 1.0
**Status:** ✅ Shipped (v1.0.0-alpha)
**Next:** Community feedback → v1.0.0 stable
