# SCRAPE SKILL v0.1
**Type**: Research (SAFE)
**Intelligence**: xAI grok-4-fast

## Purpose
High-fidelity extraction of technical markdown from target URLs for notebook ingestion.

## Affordances
- `url`: The target URL to scrape.
- `format`: Output format (default: markdown).

## Admission Contract
- Sanitizes all HTML to clean Markdown.
- Removes telemetry, scripts, and tracking artifacts.
- Outputs clean text for Open Notebook ingestion.
