# Collaborative Governance Protocol
**Standard Operating Procedure for Multi-Agent Version Control**

---

## 1. Version Control Policy

**Zero Direct Commits to Main.** All development must occur on feature branches. The Continuous Integration (CI) gateway is the sole authorized merge authority.

---

## 2. Environment Initialization

```bash
# Repository Initialization
git clone [REPO-URL]
cd [PROJECT-DIR]
npm install

# Identity Configuration
git config user.name "[USER-ID]"
git config user.email "[USER-EMAIL]"
```

---

## 3. Workflow Specification

### Session Synchronization
```bash
git checkout main
git pull origin main
```

### Submission Protocol
```bash
./scripts/[SUBMIT-SCRIPT].sh "Integration Summary"
```

The submission script executes the following:
1. Automated branch creation (User-ID + Timestamp).
2. Staging of critical directories (src/, server/, scripts/).
3. Intent-based commit generation.
4. Automated Pull Request (PR) initialization.

---

## 4. Remote Development (Port [PRIMARY-PORT])

### Peer-to-Peer Synchronization
All participants must be authenticated via the [TEAM-NETWORK].

**Host [A] → Guest [B] Connection:**
Host runs: `rojo serve --port [PRIMARY-PORT]`
Guest points plugin at: `http://[HOST-A-IP]:[PRIMARY-PORT]`

**Host [B] → Guest [A] Connection:**
Host runs: `rojo serve --port [PRIMARY-PORT]`
Guest points plugin at: `http://[HOST-B-IP]:[PRIMARY-PORT]`

**Firewall Configuration (Windows):**
```powershell
netsh advfirewall firewall add rule name="Rojo [PROJECT-NAME]" dir=in action=allow protocol=TCP localport=[PRIMARY-PORT]
```

---

## 5. Integration Validation (CI)

| Asset Type | Validation |
|-----------|------|
| `src/**/*.luau` | Syntax Verification |
| `generated/**/*.luau` | Syntax Verification |
| `server/bridge/**` | Build Verification + Governance Audit |

**Application Logic**: Files containing core game mechanics are exempt from automated score-gates to ensure development velocity.

---

## 6. Conflict Resolution

The development pipeline acts as a **Passive Validator**, not an active writer. It audits incoming code for compliance and provides remediation instructions. It is prohibited from overwriting local human-authored logic.

---

## 7. Recovery Procedures

```bash
# Check local status
git status

# Revert local changes to specific module
git checkout -- src/server/[MODULE-NAME].luau

# Reset local environment to Main
git checkout main && git pull origin main
```
