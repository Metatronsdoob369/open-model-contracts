# Repository Catalog: [PROJECT-NAME]
**Objective**: Deterministic mapping of project resources to prevent unauthorized asset overwrites.

## 🏛️ Canonical Asset Registry
The following directories and files are marked as **HUMAN-AUTHORED** and must never be overwritten by AI-agent processes without explicit manual override.

| Asset Path | Role | Governance Level |
|------------|------|------------------|
| `src/shared/` | Core Shared Logic | PROTECTED |
| `src/client/` | Client-Side Manifestation | PROTECTED |
| `src/server/` | Server-Side Authority | PROTECTED |
| `assets/geometry/` | Static Geometry | PROTECTED |

## 🛠️ Generated Output Zones
The following directories are authorized for **AI-AGENT MANIFESTATION**. These are cleared during the "Sanitize" phase of the pipeline.

- `generated/`: Raw machine output.
- `repaired/`: Results of the Refactor phase.

## 🏁 Verification Checksum
All deployment scripts must verify the presence of this catalog before initiating a `ship` event.
