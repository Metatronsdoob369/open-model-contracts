# 🎯 RECON PREP TOOL - Smart Google Dork Generator

**AI-Powered Google Search Operator Optimization**

Like DorkSearch, but smarter. Analyzes your intent and applies the most potent combination of Google search operators automatically.

---

## 🚀 Features

- **Intent Classification** - Automatically detects what you're searching for
- **Smart Operator Selection** - Applies optimal combinations of 48+ Google operators
- **Advanced Suite Mode** - Generates comprehensive dork suite for target
- **Three.js Animated UI** - Professional dark theme with 3D background
- **One-Click Search** - Direct links to Google with dork pre-filled
- **Copy-Paste Ready** - All results clipboard-ready
- **JSON Export** - Integrate with other tools

---

## 📋 Intent Classification

The engine automatically detects:

- **find_files** - PDF, DOC, Excel, configs, backups
- **find_logins** - Admin panels, login pages, dashboards
- **find_vulns** - SQL injection, LFI, RFI, open redirects
- **find_errors** - SQL errors, debug output, exceptions
- **find_configs** - XML, YAML, ENV files with secrets
- **find_emails** - Email addresses on target
- **find_subdomains** - Subdomain enumeration
- **find_tech** - Technology stack identification

---

## 🛠️ Usage

### Web Interface

```bash
# Open in browser
open index.html

# Or serve with Python
python3 -m http.server 8000
open http://localhost:8000
```

**Simple Mode:**
1. Enter target domain
2. Enter search query (e.g., "admin login", "pdf files", "SQL errors")
3. Click "Generate Dorks"

**Advanced Mode:**
1. Enter target domain
2. Click "Advanced Suite"
3. Get comprehensive dork suite across 8 categories

### CLI Interface

```bash
# Simple query
./dork-engine.py "pdf files example.com"

# With specific target
./dork-engine.py "admin login" -t example.com

# Advanced mode (full suite)
./dork-engine.py -t example.com -a

# JSON output
./dork-engine.py -t example.com -a --json
```

---

## 📊 Google Search Operators Supported

### Site/Domain
- `site:` - Limit to specific domain
- `inurl:` - Search within URLs
- `allinurl:` - All terms in URL

### Content
- `intext:` - Search within body text
- `allintext:` - All terms in text
- `intitle:` - Search within titles
- `allintitle:` - All terms in title
- `inanchor:` - Search in anchor text

### File Types
- `filetype:` - Specific file extension
- `ext:` - Alternative file extension

### Logic
- `AND`, `OR`, `NOT` - Boolean operators
- `()` - Grouping
- `*` - Wildcard
- `"` - Exact phrase
- `-` - Exclude term
- `+` - Include term

### Advanced
- `cache:` - Cached version
- `related:` - Similar sites
- `info:` - Site information
- `link:` - Pages linking to URL
- `AROUND(X)` - Proximity search
- `numrange:` - Number range
- `daterange:` - Date range

---

## 🎯 Example Outputs

### Finding PDFs
```
Input: "pdf files example.com"
Output:
- site:example.com filetype:pdf
- site:example.com ext:pdf intitle:"confidential"
- site:example.com filetype:pdf intext:"internal"
```

### Finding Admin Panels
```
Input: "admin login example.com"
Output:
- site:example.com intitle:login
- site:example.com intitle:"admin login"
- site:example.com inurl:admin
- site:example.com inurl:signin
- site:example.com intitle:"Dashboard"
```

### Finding SQL Errors
```
Input: "SQL errors example.com"
Output:
- site:example.com intext:"SQL syntax"
- site:example.com intext:"mysql_fetch"
- site:example.com intext:"Warning: mysql"
- site:example.com intext:"PostgreSQL query failed"
```

### Advanced Suite (anthropic.com)
```
Files:
- site:anthropic.com filetype:pdf
- site:anthropic.com filetype:doc
- site:anthropic.com filetype:xlsx

Logins:
- site:anthropic.com intitle:login
- site:anthropic.com inurl:admin

Configs:
- site:anthropic.com ext:xml intext:password
- site:anthropic.com ext:conf intext:key

Vulnerabilities:
- site:anthropic.com inurl:id=
- site:anthropic.com inurl:file=

Errors:
- site:anthropic.com intext:"SQL syntax"
- site:anthropic.com intext:"mysql_fetch"

Subdomains:
- site:*.anthropic.com
- site:anthropic.com -www

Emails:
- site:anthropic.com intext:"@anthropic.com"

Technology:
- site:anthropic.com intext:"powered by"
```

---

##  Integration with Safe-Recon

```bash
# Use Recon Prep to generate dorks
./dork-engine.py -t example.com -a --json > dorks.json

# Feed to Safe-Recon for automated execution
cat dorks.json | jq -r '.Files[]' | while read dork; do
    echo "Searching: $dork"
    # Could integrate with safe-recon.sh for automated discovery
done
```

---

## 🔒 Governance Integration

This tool respects constitutional governance:

**SAFE Mode (Default):**
- Generates dorks only
- No automated execution
- User manually executes searches

**ARMED Mode (Optional):**
- Could integrate with safe-recon.sh
- Automated search execution
- Requires contract (scope, expiry, owner)

---

## 🎨 UI Features

- **Three.js Background** - Animated particles
- **Dark Theme** - Professional #0A0E27 background
- **Teal Accents** - #00FFD1 highlights
- **Glass Morphism** - Subtle blur effects
- **Responsive Design** - Works on mobile/tablet
- **Copy to Clipboard** - One-click copy
- **Direct Google Search** - One-click execution
- **Stats Dashboard** - Total dorks, categories, operators

---

## 📦 Files

```
recon-prep/
├── dork-engine.py      # Python CLI tool (standalone)
├── index.html          # Web interface with Three.js
└── README.md           # This file
```

---

## 🚀 Future Enhancements

- [ ] Browser extension (Chrome/Firefox)
- [ ] n8n workflow integration
- [ ] Export to CSV/PDF
- [ ] Saved dork templates
- [ ] Custom operator combinations
- [ ] AI-powered result ranking
- [ ] Integration with Shodan/Censys
- [ ] Real-time search result preview
- [ ] Historical dork performance tracking

---

## 🎯 Use Cases

### Security Research
- Find exposed admin panels
- Discover misconfigurations
- Identify information leakage
- Enumerate attack surface

### OSINT
- Subdomain discovery
- Email harvesting
- Technology profiling
- Competitive intelligence

### Bug Bounty
- Rapid reconnaissance
- Vulnerability discovery
- Scope validation
- Evidence collection

### Penetration Testing
- Pre-engagement recon
- Passive information gathering
- Documentation generation
- Client reporting

---

## ⚠️ Legal Notice

**FOR AUTHORIZED TESTING ONLY**

This tool is designed for:
- Authorized security testing
- Bug bounty programs
- OSINT research
- Your own domains

**NEVER** use against systems you don't own or have authorization to test.

---

## 🤝 Integration Partners

Works great with:
- **Safe-Recon** - Governed reconnaissance
- **Open Model-Contracts** - Constitutional AI governance
- **n8n** - Workflow automation
- **Burp Suite** - Web security testing
- **Nuclei** - Vulnerability scanning

---

## 📚 Resources

- [Google Search Operators Guide](https://support.google.com/websearch/answer/2466433)
- [DorkSearch](https://www.dorksearch.com/)
- [GHDB (Google Hacking Database)](https://www.exploit-db.com/google-hacking-database)

---

**Built with the Revolutionary Delta methodology.**

**"Standard dork generators don't have AI-powered intent classification."**
