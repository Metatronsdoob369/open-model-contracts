#!/bin/bash
# safe-recon.sh - Governed Reconnaissance Tool
# Part of Open Model-Contracts
# "Prompts are suggestions. Contracts are law."

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIT_DIR="${AUDIT_DIR:-$HOME/.mcp/governance/audit}"
AUDIT_LOG="$AUDIT_DIR/safe-recon.log"

# Governance defaults
GATE="${GATE:-SAFE}"
SCOPE="${SCOPE:-}"
EXPIRY="${EXPIRY:-}"
OWNER="${OWNER:-$USER}"

# Output directory
OUTPUT_DIR="${OUTPUT_DIR:-./recon-output}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# GOVERNANCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

log_audit() {
    local operation="$1"
    local target="$2"
    local status="$3"
    local details="${4:-}"
    
    mkdir -p "$AUDIT_DIR"
    
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] GATE=$GATE TARGET=$target OP=$operation STATUS=$status OWNER=$OWNER DETAILS=$details" >> "$AUDIT_LOG"
}

check_armed_requirements() {
    if [[ "$GATE" == "ARMED" ]]; then
        if [[ -z "$SCOPE" ]] || [[ -z "$EXPIRY" ]] || [[ -z "$OWNER" ]]; then
            echo -e "${RED}❌ ARMED mode requires:${NC}"
            echo -e "   ${YELLOW}SCOPE${NC}  - Target scope definition"
            echo -e "   ${YELLOW}EXPIRY${NC} - ISO datetime (e.g., 2026-02-09T00:00:00Z)"
            echo -e "   ${YELLOW}OWNER${NC}  - Operator identifier"
            echo ""
            echo -e "${YELLOW}Example:${NC}"
            echo -e "  GATE=ARMED SCOPE='target.com only' EXPIRY='2026-02-09T00:00:00Z' OWNER='joe@redteam' $0 subdomain target.com"
            exit 1
        fi
        
        # Check expiry hasn't passed
        local now=$(date -u +%s)
        local expiry_epoch=$(date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$EXPIRY" +%s 2>/dev/null || echo 0)
        
        if [[ $expiry_epoch -gt 0 ]] && [[ $now -gt $expiry_epoch ]]; then
            echo -e "${RED}❌ Contract expired: $EXPIRY${NC}"
            log_audit "$1" "$2" "DENIED" "Contract expired"
            exit 1
        fi
    fi
}

print_governance_status() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SAFE-RECON v$VERSION - Governed Reconnaissance${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [[ "$GATE" == "SAFE" ]]; then
        echo -e "${GREEN}🔓 GATE: SAFE${NC} (Passive operations only)"
    else
        echo -e "${YELLOW}🔐 GATE: ARMED${NC} (Active operations enabled)"
        echo -e "   Scope:  $SCOPE"
        echo -e "   Expiry: $EXPIRY"
        echo -e "   Owner:  $OWNER"
    fi
    
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# RECON OPERATIONS
# ═══════════════════════════════════════════════════════════════════════════

subdomain_enum() {
    local target="$1"
    local output_file="$OUTPUT_DIR/subdomains_$target.txt"
    
    echo -e "${BLUE}[*]${NC} Subdomain Enumeration: $target"
    echo ""
    
    mkdir -p "$OUTPUT_DIR"
    
    # SAFE: Certificate Transparency (passive)
    echo -e "${GREEN}[SAFE]${NC} Querying crt.sh (Certificate Transparency)..."
    log_audit "subdomain_enum_crtsh" "$target" "START" ""
    
    if curl -s "https://crt.sh/?q=%.$target&output=json" | jq -r '.[].name_value' 2>/dev/null | sort -u > "$output_file"; then
        local count=$(wc -l < "$output_file" | tr -d ' ')
        echo -e "${GREEN}✓${NC} Found $count subdomains"
        log_audit "subdomain_enum_crtsh" "$target" "SUCCESS" "count=$count"
    else
        echo -e "${RED}✗${NC} crt.sh query failed"
        log_audit "subdomain_enum_crtsh" "$target" "FAILED" "crt.sh unavailable"
        return 1
    fi
    
    # ARMED: Live HTTP checks (active probing)
    if [[ "$GATE" == "ARMED" ]]; then
        check_armed_requirements "subdomain_enum_live" "$target"
        
        echo ""
        echo -e "${YELLOW}[ARMED]${NC} Checking live hosts..."
        log_audit "subdomain_enum_live" "$target" "START" ""
        
        local live_output="$OUTPUT_DIR/live_hosts_$target.txt"
        
        cat "$output_file" | xargs -P 50 -I {} sh -c 'curl -sI --max-time 3 https://{} -o /dev/null -w "{}:%{http_code}\n" 2>/dev/null || true' | grep ':200' > "$live_output" || true
        
        local live_count=$(wc -l < "$live_output" | tr -d ' ')
        echo -e "${GREEN}✓${NC} Found $live_count live hosts"
        log_audit "subdomain_enum_live" "$target" "SUCCESS" "live=$live_count"
        
        echo ""
        echo -e "${GREEN}📄 Output:${NC}"
        echo -e "   All:  $output_file"
        echo -e "   Live: $live_output"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Live checks require ARMED mode${NC}"
        echo -e "   Set: GATE=ARMED SCOPE='...' EXPIRY='...' OWNER='...'"
        echo ""
        echo -e "${GREEN}📄 Output:${NC} $output_file"
    fi
}

directory_scan() {
    local target="$1"
    local wordlist="${2:-/usr/share/wordlists/dirb/common.txt}"
    
    # ARMED ONLY
    if [[ "$GATE" != "ARMED" ]]; then
        echo -e "${RED}❌ Directory scanning requires ARMED mode${NC}"
        echo -e "   (Active probing operation)"
        log_audit "directory_scan" "$target" "DENIED" "SAFE mode"
        return 1
    fi
    
    check_armed_requirements "directory_scan" "$target"
    
    echo -e "${BLUE}[*]${NC} Directory Scan: $target"
    echo -e "${YELLOW}[ARMED]${NC} Using wordlist: $wordlist"
    echo ""
    
    if [[ ! -f "$wordlist" ]]; then
        echo -e "${RED}✗${NC} Wordlist not found: $wordlist"
        return 1
    fi
    
    mkdir -p "$OUTPUT_DIR"
    local output_file="$OUTPUT_DIR/directories_$(echo $target | sed 's|https\?://||' | tr '/' '_').txt"
    
    log_audit "directory_scan" "$target" "START" "wordlist=$wordlist"
    
    echo -e "${YELLOW}[!]${NC} Scanning... (this may take a while)"
    
    cat "$wordlist" | xargs -P 100 -I {} sh -c "curl -s '$target/{}' -w '%{http_code}:{}\n' -o /dev/null 2>/dev/null || true" | grep '^200' > "$output_file" || true
    
    local found=$(wc -l < "$output_file" | tr -d ' ')
    echo -e "${GREEN}✓${NC} Found $found accessible directories"
    log_audit "directory_scan" "$target" "SUCCESS" "found=$found"
    
    echo ""
    echo -e "${GREEN}📄 Output:${NC} $output_file"
}

api_discovery() {
    local target="$1"
    
    echo -e "${BLUE}[*]${NC} API Discovery: $target"
    echo ""
    
    mkdir -p "$OUTPUT_DIR"
    local js_dir="$OUTPUT_DIR/js_files"
    local js_urls="$OUTPUT_DIR/js_urls_$(echo $target | sed 's|https\?://||' | tr '/' '_').txt"
    
    # SAFE: Extract JS URLs (no download)
    echo -e "${GREEN}[SAFE]${NC} Extracting JavaScript URLs..."
    log_audit "api_discovery_extract_js" "$target" "START" ""
    
    if curl -s "$target" | grep -Eo 'src="[^"]+\.js"' | cut -d'"' -f2 | sed "s|^/|$target/|" > "$js_urls"; then
        local count=$(wc -l < "$js_urls" | tr -d ' ')
        echo -e "${GREEN}✓${NC} Found $count JS files"
        log_audit "api_discovery_extract_js" "$target" "SUCCESS" "count=$count"
    else
        echo -e "${RED}✗${NC} Failed to extract JS URLs"
        log_audit "api_discovery_extract_js" "$target" "FAILED" ""
        return 1
    fi
    
    # ARMED: Download and analyze
    if [[ "$GATE" == "ARMED" ]]; then
        check_armed_requirements "api_discovery_download" "$target"
        
        echo ""
        echo -e "${YELLOW}[ARMED]${NC} Downloading JavaScript files..."
        mkdir -p "$js_dir"
        log_audit "api_discovery_download" "$target" "START" ""
        
        cat "$js_urls" | xargs -P 10 -I {} sh -c 'curl -s "{}" -o "'$js_dir'/$(echo {} | md5 -q).js" 2>/dev/null || true'
        
        local downloaded=$(ls -1 "$js_dir"/*.js 2>/dev/null | wc -l | tr -d ' ')
        echo -e "${GREEN}✓${NC} Downloaded $downloaded files"
        log_audit "api_discovery_download" "$target" "SUCCESS" "downloaded=$downloaded"
        
        echo ""
        echo -e "${YELLOW}[ARMED]${NC} Extracting API endpoints..."
        local api_endpoints="$OUTPUT_DIR/api_endpoints_$(echo $target | sed 's|https\?://||' | tr '/' '_').txt"
        log_audit "api_discovery_extract_endpoints" "$target" "START" ""
        
        grep -rhEo 'https?://[^"'\'']+/api/[^"'\'']+' "$js_dir/" 2>/dev/null | sort -u > "$api_endpoints" || true
        
        local endpoints=$(wc -l < "$api_endpoints" | tr -d ' ')
        echo -e "${GREEN}✓${NC} Found $endpoints API endpoints"
        log_audit "api_discovery_extract_endpoints" "$target" "SUCCESS" "endpoints=$endpoints"
        
        echo ""
        echo -e "${YELLOW}[ARMED]${NC} Testing API endpoints..."
        local live_apis="$OUTPUT_DIR/live_apis_$(echo $target | sed 's|https\?://||' | tr '/' '_').txt"
        log_audit "api_discovery_test_endpoints" "$target" "START" ""
        
        cat "$api_endpoints" | xargs -P 20 -I {} sh -c 'curl -s "{}" -w "%{http_code}:{}\n" -o /dev/null 2>/dev/null || true' | grep -v '^404' > "$live_apis" || true
        
        local live=$(wc -l < "$live_apis" | tr -d ' ')
        echo -e "${GREEN}✓${NC} Found $live live APIs"
        log_audit "api_discovery_test_endpoints" "$target" "SUCCESS" "live=$live"
        
        echo ""
        echo -e "${GREEN}📄 Output:${NC}"
        echo -e "   JS URLs:       $js_urls"
        echo -e "   JS Files:      $js_dir/"
        echo -e "   API Endpoints: $api_endpoints"
        echo -e "   Live APIs:     $live_apis"
    else
        echo ""
        echo -e "${YELLOW}⚠️  JS download and API testing require ARMED mode${NC}"
        echo ""
        echo -e "${GREEN}📄 Output:${NC} $js_urls"
    fi
}

credential_scan() {
    local repo_path="$1"
    
    # ARMED ONLY
    if [[ "$GATE" != "ARMED" ]]; then
        echo -e "${RED}❌ Credential scanning requires ARMED mode${NC}"
        echo -e "   (Accesses local files/repos)"
        log_audit "credential_scan" "$repo_path" "DENIED" "SAFE mode"
        return 1
    fi
    
    check_armed_requirements "credential_scan" "$repo_path"
    
    echo -e "${BLUE}[*]${NC} Credential Scan: $repo_path"
    echo -e "${YELLOW}[ARMED]${NC} Scanning for secrets..."
    echo ""
    
    if [[ ! -d "$repo_path" ]]; then
        echo -e "${RED}✗${NC} Directory not found: $repo_path"
        return 1
    fi
    
    mkdir -p "$OUTPUT_DIR"
    local findings="$OUTPUT_DIR/credentials_$(basename $repo_path).txt"
    
    log_audit "credential_scan" "$repo_path" "START" ""
    
    # Pattern matching for common secrets
    echo -e "${YELLOW}[!]${NC} Searching for patterns..."
    
    find "$repo_path" -type f \( -name "*.py" -o -name "*.js" -o -name "*.env" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" \) -exec grep -l -E '(password|api_key|secret|token|apikey|api-key)' {} \; 2>/dev/null > "$findings" || true
    
    local files_found=$(wc -l < "$findings" | tr -d ' ')
    echo -e "${GREEN}✓${NC} Found secrets in $files_found files"
    
    if [[ $files_found -gt 0 ]]; then
        echo ""
        echo -e "${YELLOW}[!]${NC} Extracting credentials with context..."
        local creds_detail="$OUTPUT_DIR/credentials_detail_$(basename $repo_path).txt"
        
        cat "$findings" | xargs grep --color=always -nE '(password|api_key|token|secret).*=.*["\047]([^"\047]+)' 2>/dev/null > "$creds_detail" || true
        
        echo -e "${GREEN}✓${NC} Detailed output saved"
        
        echo ""
        echo -e "${GREEN}📄 Output:${NC}"
        echo -e "   Files with secrets: $findings"
        echo -e "   Detailed extract:   $creds_detail"
    else
        echo -e "${GREEN}✓${NC} No obvious credentials found"
    fi
    
    log_audit "credential_scan" "$repo_path" "SUCCESS" "files=$files_found"
}

tech_fingerprint() {
    local target="$1"
    
    echo -e "${BLUE}[*]${NC} Technology Fingerprinting: $target"
    echo ""
    
    mkdir -p "$OUTPUT_DIR"
    local output="$OUTPUT_DIR/tech_stack_$(echo $target | sed 's|https\?://||' | tr '/' '_').txt"
    
    # SAFE: Passive fingerprinting
    echo -e "${GREEN}[SAFE]${NC} Analyzing HTTP headers and content..."
    log_audit "tech_fingerprint" "$target" "START" ""
    
    {
        echo "=== HTTP Headers ==="
        curl -sI "$target" 2>/dev/null || echo "Failed to fetch headers"
        
        echo ""
        echo "=== Server Info ==="
        curl -sI "$target" 2>/dev/null | grep -i 'server\|x-powered-by\|x-aspnet-version' || echo "No server headers found"
        
        echo ""
        echo "=== Detected Technologies ==="
        curl -s "$target" 2>/dev/null | grep -Eoi '(wordpress|drupal|joomla|django|flask|express|nginx|apache|react|vue|angular)' | sort -u || echo "No common frameworks detected"
        
    } > "$output"
    
    echo -e "${GREEN}✓${NC} Fingerprinting complete"
    log_audit "tech_fingerprint" "$target" "SUCCESS" ""
    
    echo ""
    echo -e "${GREEN}📄 Output:${NC} $output"
    
    # Show summary
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    grep -E 'server|x-powered-by|wordpress|django|react' "$output" | head -5 || echo "  No major tech detected"
}

# ═══════════════════════════════════════════════════════════════════════════
# USAGE & MAIN
# ═══════════════════════════════════════════════════════════════════════════

usage() {
    cat << EOF
${BLUE}SAFE-RECON v$VERSION - Governed Reconnaissance Tool${NC}
Part of Open Model-Contracts

${YELLOW}USAGE:${NC}
  $0 <operation> <target> [options]

${YELLOW}OPERATIONS:${NC}
  ${GREEN}subdomain${NC} <domain>           - Enumerate subdomains (SAFE: passive, ARMED: live checks)
  ${GREEN}directory${NC} <url> [wordlist]   - Directory bruteforce (ARMED only)
  ${GREEN}api${NC} <url>                    - API discovery from JS (SAFE: extract, ARMED: test)
  ${GREEN}credentials${NC} <repo-path>      - Scan for secrets (ARMED only)
  ${GREEN}fingerprint${NC} <url>            - Technology fingerprinting (SAFE)

${YELLOW}GOVERNANCE:${NC}
  ${GREEN}SAFE mode${NC}  (default) - Passive reconnaissance only
  ${GREEN}ARMED mode${NC} - Active operations (requires SCOPE, EXPIRY, OWNER)

${YELLOW}ENVIRONMENT VARIABLES:${NC}
  GATE=SAFE|ARMED       - Governance gate (default: SAFE)
  SCOPE="description"   - Target scope (required for ARMED)
  EXPIRY="ISO datetime" - Contract expiry (required for ARMED)
  OWNER="identifier"    - Operator ID (required for ARMED)
  OUTPUT_DIR="path"     - Output directory (default: ./recon-output)

${YELLOW}EXAMPLES:${NC}
  # SAFE mode - passive subdomain enum
  $0 subdomain example.com

  # ARMED mode - subdomain enum with live checks
  GATE=ARMED SCOPE='example.com only' EXPIRY='2026-02-09T00:00:00Z' OWNER='joe@redteam' \\
    $0 subdomain example.com

  # ARMED mode - directory scan
  GATE=ARMED SCOPE='example.com/app only' EXPIRY='2026-02-09T12:00:00Z' OWNER='joe@redteam' \\
    $0 directory https://example.com/app

  # SAFE mode - tech fingerprint
  $0 fingerprint https://example.com

${YELLOW}AUDIT LOG:${NC}
  $AUDIT_LOG

${BLUE}"Prompts are suggestions. Contracts are law."${NC}
EOF
}

main() {
    if [[ $# -lt 2 ]]; then
        usage
        exit 1
    fi
    
    local operation="$1"
    local target="$2"
    local option="${3:-}"
    
    print_governance_status
    
    case "$operation" in
        subdomain)
            subdomain_enum "$target"
            ;;
        directory)
            directory_scan "$target" "$option"
            ;;
        api)
            api_discovery "$target"
            ;;
        credentials)
            credential_scan "$target"
            ;;
        fingerprint)
            tech_fingerprint "$target"
            ;;
        *)
            echo -e "${RED}Unknown operation: $operation${NC}"
            echo ""
            usage
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Operation Complete${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
}

# Run
main "$@"
