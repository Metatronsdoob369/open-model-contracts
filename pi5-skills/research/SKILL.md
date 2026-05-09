# RESEARCH ORCHESTRATOR v0.1
**Type**: Research (SAFE)
**Intelligence**: xAI grok-4-fast

## Purpose
End-to-end research brief generation by orchestrating dorking, scraping, and indexing.

## Affordances
- `topic`: The research subject.
- `archive`: Boolean (default true) - store results in Open Notebook.

## Admission Contract
- Sequential execution of `g-dork` -> `scrape` -> `grok-indexer`.
- Merges findings into a single research brief.
- Tags results with 3072-D resonance metadata.
