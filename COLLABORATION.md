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
git config user.email "your@email.com"
```

That's it. You're ready.

---

## Daily Flow — Both of You

### When you start a session
```bash
git checkout main
git pull origin main
```

### When you finish building something
```bash
./scripts/sovereign-submit.sh "what you built"
```

That one command:
1. Creates a feature branch with your name + timestamp
2. Stages your changes (src/, generated/, server/, scripts/)
3. Commits with intent message
4. Pushes and auto-opens a PR

The CI pipeline runs automatically. If it passes — merge it. If it flags issues — it comments exactly what to fix.

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
generated/        ← AI-generated modules (pipeline output)
server/bridge/    ← TypeScript bridge server (governance gate applies here)
scripts/          ← Tooling (sovereign-submit.sh lives here)
```

---

## Summary

| Who | Does what |
|-----|-----------|
| Joe's Claude Code | Builds features, merges PRs, owns main |
| Marsh's Claude Code | Builds game logic, submits via `sovereign-submit.sh` |
| CI (GitHub Actions) | Neutral gatekeeper — syntax + build only, never overwrites |
