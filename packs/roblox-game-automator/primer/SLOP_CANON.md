# Slop Canon — Roblox Game Automator

Purpose: encode failures once, attach concrete guardrails, and prevent repeat regressions.

## Entry Format
- `ID`: stable failure key
- `Observed`: what failed in live run
- `Why It Was Silent`: why it escaped earlier checks
- `Permanent Guardrail`: deterministic prevention
- `Verification`: exact signal that the guardrail is active

## SC-RBX-001 — Base64 Decode Runtime Gap
- `Observed`: `HttpService:Base64Decode` unavailable in Studio runtime; escrow modules failed to load.
- `Why It Was Silent`: loader assumed API parity across Studio/runtime variants.
- `Permanent Guardrail`: loader must include pure-Lua Base64 fallback and prefer native decode only when available.
- `Verification`: server log shows module load success without `Base64Decode is not a valid member` errors.

## SC-RBX-002 — Dynamic Execution Gate
- `Observed`: `loadstring() is not available` stopped module execution.
- `Why It Was Silent`: environment setting dependency was implicit, not asserted.
- `Permanent Guardrail`: loader hard-fails with explicit error when `loadstring` is unavailable; deployment checklist requires server-side execution capability before escrow polling.
- `Verification`: no `loadstring() unavailable` error in server logs after loader start.

## SC-RBX-003 — Spawn/Geometry Collision at Origin
- `Observed`: avatar spawned immovable/grounded while world partially appeared.
- `Why It Was Silent`: generated arena placed dense geometry near `(0,0,0)` while spawn also landed near origin.
- `Permanent Guardrail`: loader enforces `OMC_SafeSpawn` offset from world anchor, clears blocker geometry in safe zone, and restores humanoid mobility.
- `Verification`: log line `World sanity enforced around safe spawn` and controllable player movement immediately after load.

## SC-RBX-004 — False Positive World Logs
- `Observed`: logs reported systems spawned, but player-visible world state did not match.
- `Why It Was Silent`: log events emitted on code path intent, not on end-state assertions.
- `Permanent Guardrail`: loader/post-load checks must validate playable invariants (spawn reachable, floor present, character movable) rather than module init alone.
- `Verification`: post-load invariants pass before session marked fully live.

## SC-RBX-005 — Bridge Port Drift
- `Observed`: orchestrator/clients attempted wrong bridge port during bring-up.
- `Why It Was Silent`: defaults diverged between publisher and standalone bridge runtime.
- `Permanent Guardrail`: `OMC_BRIDGE_URL` authoritative in pack env; fallback defaults aligned to active bridge port.
- `Verification`: bridge health and escrow round-trip succeed without manual URL edits.

## Non-Negotiable Invariants (Playability Gate)
1. A valid spawn point exists outside dense generated geometry.
2. Active character has movement control (`PlatformStand=false`, not anchored, non-zero walk/jump settings).
3. A collision floor exists under spawn and around immediate traversal radius.
4. Escrow modules decode and execute without runtime API incompatibility.
5. Session is only considered `live` after invariants pass.

## Operational Rule
If a new failure appears twice, add a new Slop Canon entry before further feature work.
