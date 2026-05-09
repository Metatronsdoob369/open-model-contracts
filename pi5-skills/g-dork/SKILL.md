# G-DORK SKILL v0.1
**Type**: Research (SAFE)
**Network**: Tor SOCKS5 (127.0.0.1:9050)
**Intelligence**: xAI grok-4-fast

## Purpose
Automated construction and execution of dork queries to identify vulnerabilities and technical exposures.

## Affordances
- `query`: The natural language intent for the dork.
- `depth`: Number of result pages to scrape (default 1).

## Admission Contract
- Rotates Tor circuit between batches.
- No direct Google interaction (routes via Startpage).
- Output is JSON-formatted dork results.
