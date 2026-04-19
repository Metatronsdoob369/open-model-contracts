# 2026-04-14 — Rojo alignment, Superbullet tests, research scaffold (cross-repo)

## Context
- Parent: open-model-contracts; child: b0t (executor/automation stack).
- Goal: prep Superbullet repair/generation tests, align Rojo with Studio plugin, and set up shared research/notes workflow.

## Actions
- Upgraded Rojo to 7.7.0-rc.1 (protocol 5) and launched server on port 34900 via `scripts/rojo-serve.sh` in open-model-contracts.
- Updated Superbullet test suite (open-model-contracts) to use env-driven embedder/Qdrant, include natural broken specimen via `BROKEN_LUA`, added `test:superbullet` script.
- Scaffolded notes workspace (conversations, ideas, research) and research index script plan.
- Added placeholder research summary and conventions for citation linkage.

## Next steps
- Add real PDFs + summaries to research folders and run research indexing.
- Optionally sync research metadata with NocoDB/OpenNotebook under b0t.
- Mirror VLM guardrail idea for post-Manifestation visual QA; tie findings to workflow metadata.
