# OMC Collaboration Protocol
**For Joe + Marsh — Agent-to-Agent, Zero Overwrite**

---

## The One Rule

**Never commit directly to `main`.** Everything goes through a feature branch. The CI gate merges it.

---

## Marsh — Getting Started (One Time)

```bash
# Clone the repo
git clone https://github.com/Metatronsdoob369/open-model-contracts.git
cd open-model-contracts
npm install

# Tell git who you are
git config user.name "Marsh"
git config user.email "marshlawler@gmail.com"
```

That's it. You're ready.

---

## Daily Flow

### Joe — when you start a session
```bash
git checkout main
git pull origin main
```

### Joe — when you finish building something
```bash
./scripts/sovereign-submit.sh "what you built"
```

That command creates a branch, commits, pushes, and opens a PR. CI runs automatically.

---

### Marsh — submit via bridge (no git required)

Marsh does **not** run git commands. His Claude Code submits through the bridge:

```
POST http://100.77.14.97:8080/submit
Headers:
  x-omc-key:  <OMC_SUBMIT_KEY>
  x-omc-sig:  <HMAC-SHA256 of JSON body>
Body:
  { "author": "marsh", "intent": "what you built", "files": [{ "path": "src/server/HousingService.luau", "content": "..." }] }
```

The bridge:
1. Writes the files to the repo on Joe's machine
2. Creates a feature branch `feat/marsh-<timestamp>`
3. Commits + pushes
4. Returns a PR URL — CI runs automatically

**Allowed paths:** `src/server/`, `src/client/`, `src/generated/`

Marsh's Claude Code handles signing automatically via the Marsh MCP (`server/marsh-mcp/`).

The CI pipeline runs automatically. If it passes — Joe merges it. If it flags issues — it comments exactly what to fix.

---

## Live Co-Dev via Rojo + Tailscale (Port 7777)

Both machines must be on the same Tailscale network.

### Joe serves → Marsh watches
Joe runs:
```bash
rojo serve --port 7777
```
Marsh points his Studio Rojo plugin at:
```
http://100.77.14.97:7777
```

### Marsh serves → Joe watches
Marsh runs:
```powershell
rojo serve --port 7777
```
Joe points his Studio Rojo plugin at:
```
http://100.80.10.68:7777
```

### Both serving simultaneously
```
Joe   → port 7777  →  Marsh's Studio
Marsh → port 7777  →  Joe's Studio
```
Live real-time co-authoring. When the session is done, one `sovereign-submit.sh` locks it into GitHub.

**Windows firewall rule (Marsh — one time):**
```powershell
netsh advfirewall firewall add rule name="Rojo OMC" dir=in action=allow protocol=TCP localport=7777
```

---

## What the CI Checks

| File type | Gate |
|-----------|------|
| `src/**/*.luau` | Luau syntax check |
| `generated/**/*.luau` | Luau syntax check |
| `server/bridge/**` | Full TypeScript build + governance gate |
| Everything else | Passes automatically |

**Game logic files (Luau) are NOT resonance-gated.** Only bridge/escrow code is.
Marsh's game modules will never be blocked for resonance score.

---

## Why Your Work Was Getting Erased (Marsh)

The pipeline was treating itself as the sole author. Any file that drifted
from the cached canonical state got repaired back automatically.

Now the pipeline is a **gatekeeper, not a writer**. It checks your code and
either clears it or tells you exactly what to fix. It never overwrites anything.

---

## Merge — When CI Is Green

```bash
# Merge a cleared PR from the CLI
gh pr merge --squash --auto

# Or just open the PR link printed by sovereign-submit.sh and click Merge
```

---

## Branch Naming (auto-handled by the script)

- Joe: `feat/joe-wales-20260420-211500`
- Marsh: `feat/marsh-20260420-211500`

Never use `main`, `master`, or `sovereign` as branch names.

---

## If Something Goes Wrong

```bash
# See what changed locally
git status

# Undo uncommitted changes to one file
git checkout -- src/server/TagGameService.luau

# Start fresh from main
git checkout main && git pull origin main
```

---

## Repo Structure

```
src/server/       ← Server Luau (Marsh's domain for game logic)
src/client/       ← Client Luau (controllers, HUD)
src/generated/    ← AI-generated modules (pipeline output)
server/bridge/    ← TypeScript bridge server (governance gate applies here)
server/marsh-mcp/ ← Marsh's Claude Code MCP (git-free submit tool)
scripts/          ← Tooling (sovereign-submit.sh lives here)
```

---

## Summary

| Who | Does what |
|-----|-----------|
| Joe's Claude Code | Builds features, merges PRs, owns main |
| Marsh's Claude Code | Builds game logic, submits via bridge POST /submit (auto-branch + PR) |
| CI (GitHub Actions) | Neutral gatekeeper — syntax + build only, never overwrites |
| Rojo + Tailscale | Live co-dev preview on port 7777 |
