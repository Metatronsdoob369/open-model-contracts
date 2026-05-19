# Return Steps (Current)

## Environment
- Bridge URL: `http://127.0.0.1:3099`
- Loader: `packs/roblox-game-automator/lua/Loader.lua`
- Failure memory: `packs/roblox-game-automator/primer/SLOP_CANON.md`

## Start Order
1. Start bridge service and confirm `GET /health` is green.
2. Ensure `Loader.lua` is pasted as a full script in `ServerScriptService`.
3. Open Studio and press Play.

## Expected Logs
- `[OMC] Auto-Loader started (escrow mode)...`
- `[OMC] New session detected: ...`
- `[OMC] Session ... live — N module(s)`
- `[OMC] World sanity enforced around safe spawn: (...)`

## If Playability Fails
- Do not patch line-by-line in Studio.
- Replace with full latest `Loader.lua`.
- Record the failure in `primer/SLOP_CANON.md` before next iteration.
