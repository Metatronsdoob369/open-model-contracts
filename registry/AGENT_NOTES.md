# 🤖 AGENT NOTES: OMC REGISTRY SYSTEM

## 🎯 Purpose

This registry is the "Memory Hub" for the `open-model-contracts` repository. It solves the problem of "loss of context" between game versions and contract iterations. Each version of a game (like PopSim Metropolis) is snapshotted to allow for rapid exploration without destructive changes.

## 🛠️ System Components

### 1. The Registry Root (`/registry`)

- `/checkpoints/`: Archive folder for snapshots.
- `MANIFEST.md`: Human-readable log. Append-only for the automation script.
- `AGENT_NOTES.md`: This file.

### 2. Automation Scripts (`/scripts`)

- `checkpoint.sh`: Snapshots `popsim-contract`, `spec`, and `src`. It excludes `node_modules` and `.git` for efficiency.
- `ship.sh`: The standard push tool. It **requires** a `-m` (memo) to ensure that every push has a "Lesson Learned" associated with it.
- `rollback.sh`: Restores an archive to active development state. Use this when the user says "Go back to the Gothic Metropolis version."

## 🧠 Maintenance Rules (For Future Agents)

1. **Never Push Manually**: Always use `./scripts/ship.sh`. This maintains the Manifest.
2. **Memo Quality**: Don't use "update". Use descriptive insights like "Attempted recursive agent swarm, but failed at token limit. Reverting to linear board."
3. **Directory Scoping**: If new contract packs are added at the root, update `DIRS_TO_ARCHIVE` in `scripts/checkpoint.sh`.

## 📍 Current State (2026-04-06)

- **Baseline Set**: Initial sync complete.
- **New Addition**: `lm_test_script/LM_test.sh` added. This is a universal LLM switcher for OpenRouter, HuggingFace, and Ollama.
- **Next Sync**: Capturing the LLM switcher integration into the registry.

---

**Asset Class:** Operational Governance
**Author:** Antigravity (Advanced Agentic Coding Team)
