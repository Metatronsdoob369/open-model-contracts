# Changelog

All notable changes to Open Model-Contracts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha] - 2026-02-25

### Added
- **Core specification documents**
  - `spec/OVERVIEW.md` — Introduction and motivation
  - `spec/CONTRACTS.md` — Schema specification
  - `spec/GATES.md` — SAFE/ARMED execution model
  - `spec/ADMISSION.md` — MCP tool admission criteria
  - `spec/GOVERNANCE.md` — Constitutional governance framework
  - `spec/DREAM_CYCLE.md` — Self-improvement specification

- **Reference implementation**
  - `examples/ai-operations-manager/` — 150-line working example
  - Demonstrates Zod schemas, gate validation, discriminated unions

- **Domicile governance bundle**
  - Relocated from domicile_live workspace
  - Includes admission contracts for MCP, OpenClaw, Terraform, n8n, Open Notebook
  - SAFE/ARMED tool allowlists
  - Governed target routing profiles

- **Package structure**
  - MIT license
  - Package.json with proper metadata
  - TypeScript configuration

### Changed
- N/A (initial release)

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## Unreleased (Future 1.0.0 stable)

### Planned
- [ ] Multi-agent coordination contracts
- [ ] Streaming execution contracts
- [ ] Trust scoring standardization
- [ ] Additional reference implementations (healthcare, finance, legal)
- [ ] npm package publication
- [ ] Interactive documentation site

---

## Version History

- **1.0.0-alpha** (2026-02-25) — Initial public release
- **0.x.x** (2025-2026) — Internal development (domicile_live workspace)
