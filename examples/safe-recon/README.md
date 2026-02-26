# SAFE-RECON - Governed Reconnaissance Tool

**Part of Open Model-Contracts**

> "Prompts are suggestions. Contracts are law."

Constitutional governance for reconnaissance operations. Enforces SAFE/ARMED gates with full audit logging.

---

## 🎯 Features

- **5 Core Operations**: Subdomain enum, directory scan, API discovery, credential scanning, tech fingerprinting
- **Constitutional Governance**: SAFE (passive) and ARMED (active) modes
- **Full Audit Trail**: Every operation logged with timestamps
- **Contract Enforcement**: ARMED operations require scope, expiry, and owner
- **Parallel Execution**: Fast concurrent operations
- **Clean Output**: Organized results in `recon-output/`

---

## 🚀 Quick Start

### SAFE Mode (Passive - No Approval Needed)

```bash
# Subdomain enumeration (Certificate Transparency only)
./safe-recon.sh subdomain example.com

# Technology fingerprinting
./safe-recon.sh fingerprint https://example.com

# API discovery (extract JS URLs only)
./safe-recon.sh api https://example.com
```

### ARMED Mode (Active - Requires Contract)

```bash
# Subdomain enum with live HTTP checks
GATE=ARMED \
SCOPE='example.com only' \
EXPIRY='2026-02-09T00:00:00Z' \
OWNER='joe@redteam' \
  ./safe-recon.sh subdomain example.com

# Directory bruteforce
GATE=ARMED \
SCOPE='example.com/app only' \
EXPIRY='2026-02-09T12:00:00Z' \
OWNER='joe@redteam' \
  ./safe-recon.sh directory https://example.com/app

# Full API discovery (download JS + test endpoints)
GATE=ARMED \
SCOPE='example.com' \
EXPIRY='2026-02-10T00:00:00Z' \
OWNER='joe@redteam' \
  ./safe-recon.sh api https://example.com

# Credential scanning
GATE=ARMED \
SCOPE='/path/to/repos' \
EXPIRY='2026-02-09T18:00:00Z' \
OWNER='joe@redteam' \
  ./safe-recon.sh credentials /path/to/repo
```

---

## 📋 Operations

| Operation | SAFE Mode | ARMED Mode | Description |
|-----------|-----------|------------|-------------|
| `subdomain` | ✅ crt.sh lookup | ✅ + Live HTTP checks | Enumerate subdomains |
| `directory` | ❌ | ✅ Wordlist bruteforce | Find accessible directories |
| `api` | ✅ Extract JS URLs | ✅ + Download + Test | Discover API endpoints |
| `credentials` | ❌ | ✅ Secret scanning | Find hardcoded secrets |
| `fingerprint` | ✅ Headers + content | ✅ (same as SAFE) | Identify technologies |

---

## 🔐 Governance Model

### SAFE Mode (Default)
- **Passive operations only**
- No active probing
- No contract required
- Auto-approved
- Examples: DNS queries, certificate transparency, HTTP headers

### ARMED Mode
- **Active operations**
- Requires 3 parameters:
  - `SCOPE`: Target description (e.g., "example.com only")
  - `EXPIRY`: ISO datetime (e.g., "2026-02-09T00:00:00Z")
  - `OWNER`: Operator identifier (e.g., "joe@redteam")
- Contract validates before execution
- Expires automatically
- Full audit logging

---

## 📊 Output Structure

```
recon-output/
├── subdomains_example.com.txt          # All discovered subdomains
├── live_hosts_example.com.txt          # Live HTTP 200 responses
├── directories_example.com.txt         # Accessible directories
├── js_urls_example.com.txt             # JavaScript file URLs
├── js_files/                           # Downloaded JS files
│   ├── abc123.js
│   └── def456.js
├── api_endpoints_example.com.txt       # Extracted API paths
├── live_apis_example.com.txt           # Responding APIs
├── credentials_reponame.txt            # Files with secrets
├── credentials_detail_reponame.txt     # Extracted credentials
└── tech_stack_example.com.txt          # Technology fingerprint
```

---

## 🔍 Audit Log

Every operation is logged to `~/.mcp/governance/audit/safe-recon.log`

```
[2026-02-08T14:30:00Z] GATE=SAFE TARGET=example.com OP=subdomain_enum_crtsh STATUS=SUCCESS OWNER=joe DETAILS=count=42
[2026-02-08T14:35:00Z] GATE=ARMED TARGET=example.com OP=subdomain_enum_live STATUS=SUCCESS OWNER=joe@redteam DETAILS=live=12
[2026-02-08T14:40:00Z] GATE=ARMED TARGET=example.com OP=directory_scan STATUS=START OWNER=joe@redteam DETAILS=wordlist=/usr/share/wordlists/dirb/common.txt
```

---

## 🛠️ Requirements

- `bash` 4.0+
- `curl`
- `jq` (for JSON parsing)
- `xargs` (parallel execution)
- `md5` or `md5sum` (file hashing)

**Optional:**
- `/usr/share/wordlists/dirb/common.txt` (for directory scanning)

---

## 🎓 Examples

### Example 1: Passive Recon Workflow

```bash
# 1. Find subdomains (passive)
./safe-recon.sh subdomain example.com

# 2. Fingerprint main site
./safe-recon.sh fingerprint https://example.com

# 3. Extract JS URLs
./safe-recon.sh api https://example.com

# All SAFE mode - no approval needed
```

### Example 2: Active Recon (Authorized Engagement)

```bash
# Set contract variables
export GATE=ARMED
export SCOPE='example.com web application - authorized pentest'
export EXPIRY='2026-02-10T00:00:00Z'
export OWNER='joe@redteam.local'

# 1. Subdomain enum with live checks
./safe-recon.sh subdomain example.com

# 2. Directory scan on main site
./safe-recon.sh directory https://example.com

# 3. Full API discovery
./safe-recon.sh api https://example.com

# 4. Scan downloaded repos for secrets
./safe-recon.sh credentials ~/repos/example-app

# All operations audited under same contract
```

### Example 3: Expired Contract Protection

```bash
# Contract expires in the past
GATE=ARMED \
SCOPE='example.com' \
EXPIRY='2020-01-01T00:00:00Z' \
OWNER='joe' \
  ./safe-recon.sh subdomain example.com

# Output:
# ❌ Contract expired: 2020-01-01T00:00:00Z
```

---

## 🔗 Integration with Open Model-Contracts

This tool demonstrates the Open Model-Contracts governance framework:

1. **Contract Definition**: GATE, SCOPE, EXPIRY, OWNER
2. **Gate Enforcement**: SAFE vs ARMED validation
3. **Audit Logging**: Full operation trail
4. **Reversibility**: SAFE operations are reversible (passive)
5. **Non-reversibility**: ARMED operations are irreversible (active probes)

---

## 📝 License

MIT License - Part of Open Model-Contracts

---

## 🎯 Philosophy

**"Prompts are suggestions. Contracts are law."**

Red team operations require governance. This tool enforces constitutional boundaries:

- **SAFE** = Reconnaissance you'd do from public sources
- **ARMED** = Active probing that leaves traces

Every scan is logged. Every contract expires. Every operation is governed.

---

## 🚨 Legal Notice

**FOR AUTHORIZED TESTING ONLY**

This tool is designed for:
- ✅ Authorized penetration testing
- ✅ Bug bounty programs
- ✅ Security research on your own systems
- ✅ Educational labs and CTFs

**NEVER** use this tool against systems you don't own or have explicit written authorization to test.

The governance model is a **safety mechanism**, not a legal authorization. Always obtain proper authorization before conducting security testing.

---

## 🤝 Contributing

Part of the Open Model-Contracts project. See main repository for contribution guidelines.

Built with the "Revolutionary Delta" - because standard recon tools don't have constitutional governance.
