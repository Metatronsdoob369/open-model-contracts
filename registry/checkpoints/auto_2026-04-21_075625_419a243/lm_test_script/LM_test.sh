#!/bin/bash
# ============================================================
# lm — Universal LLM Switcher
# Providers: OpenRouter (300+ models) | HuggingFace Pro | Ollama (local)
# Run once: bash lm-setup.sh
# ============================================================

set -e

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${BLUE}→${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
die()   { echo -e "${RED}✗${NC} $*"; exit 1; }

echo ""
echo "  lm — Universal LLM Switcher Setup"
echo "  ─────────────────────────────────"
echo ""

# ── 1. Dependencies ──────────────────────────────────────────
info "Checking dependencies..."

# Homebrew (macOS)
if ! command -v brew &>/dev/null; then
  info "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# fzf — fuzzy finder (the picker)
if ! command -v fzf &>/dev/null; then
  info "Installing fzf..."
  brew install fzf
else
  ok "fzf $(fzf --version)"
fi

# jq — JSON parsing for model lists
if ! command -v jq &>/dev/null; then
  info "Installing jq..."
  brew install jq
else
  ok "jq $(jq --version)"
fi

# Ollama — local inference
if ! command -v ollama &>/dev/null; then
  info "Installing Ollama..."
  brew install ollama
  ok "Ollama installed. Run 'ollama serve' to start the local daemon."
else
  ok "Ollama $(ollama --version 2>/dev/null || echo 'installed')"
fi

# llm CLI — terminal interface for all providers
if ! command -v llm &>/dev/null; then
  info "Installing llm CLI..."
  brew install llm 2>/dev/null || pip3 install llm
fi
# Plugins
llm install llm-ollama    2>/dev/null || true
llm install llm-openrouter 2>/dev/null || true
ok "llm CLI ready"

# ── 2. Credentials ───────────────────────────────────────────
mkdir -p "$HOME/.config/lm"
KEYS_FILE="$HOME/.config/lm/keys.env"

echo ""
echo "  Credentials (leave blank to skip a provider)"
echo "  ─────────────────────────────────────────────"

# Load existing keys if present
[ -f "$KEYS_FILE" ] && source "$KEYS_FILE"

# OpenRouter
echo ""
echo "  OpenRouter — 300+ models (openai, anthropic, google, meta, mistral, ...)"
echo "  Get key: https://openrouter.ai/keys"
read -rsp "  OpenRouter API key [${OPENROUTER_API_KEY:+already set, enter to keep}]: " or_key
echo ""
[ -n "$or_key" ] && OPENROUTER_API_KEY="$or_key"
[ -n "$OPENROUTER_API_KEY" ] && llm keys set openrouter <<< "$OPENROUTER_API_KEY" 2>/dev/null || true

# HuggingFace
echo "  HuggingFace Pro — HF-native models + inference providers"
echo "  Get key: https://huggingface.co/settings/tokens"
read -rsp "  HF token [${HF_TOKEN:+already set, enter to keep}]: " hf_key
echo ""
[ -n "$hf_key" ] && HF_TOKEN="$hf_key"

# Write keys file (chmod 600)
cat > "$KEYS_FILE" << KEYS
export OPENROUTER_API_KEY="${OPENROUTER_API_KEY}"
export HF_TOKEN="${HF_TOKEN}"
KEYS
chmod 600 "$KEYS_FILE"
ok "Keys saved to $KEYS_FILE (600)"

# ── 3. Write the switcher ─────────────────────────────────────
cat > "$HOME/.config/lm/switch.sh" << 'SWITCHER'
# ============================================================
# lm — Universal LLM Switcher
# source ~/.config/lm/switch.sh  (auto-loaded from shell rc)
#
# Usage:
#   lm               — fuzzy-pick from ALL available models
#   lm <query>       — fuzzy-pick filtered by query string
#   lm -r <query>    — OpenRouter models only
#   lm -h <query>    — HuggingFace models only
#   lm -l            — local Ollama models only
#   lm ping          — test active model
#   lm pull          — pull a new Ollama model (prompts for name)
#   lm status        — show current active model + env
#   lm chat          — drop into llm CLI chat with active model
# ============================================================

[ -f "$HOME/.config/lm/keys.env" ] && source "$HOME/.config/lm/keys.env"

# ── Fetch OpenRouter model list (cached 1hr) ──────────────────
_lm_openrouter_models() {
  local cache="$HOME/.config/lm/.cache_openrouter"
  local now=$(date +%s)
  if [ -f "$cache" ] && [ $(( now - $(stat -f%m "$cache" 2>/dev/null || echo 0) )) -lt 3600 ]; then
    cat "$cache"
    return
  fi
  curl -s https://openrouter.ai/api/v1/models \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    2>/dev/null \
  | jq -r '.data[] | "[OR] \(.id)\t\(.name // "")\t$\(.pricing.prompt // "?")/1k"' 2>/dev/null \
  | tee "$cache"
}

# ── Fetch HuggingFace inference-ready models ──────────────────
_lm_hf_models() {
  local cache="$HOME/.config/lm/.cache_hf"
  local now=$(date +%s)
  if [ -f "$cache" ] && [ $(( now - $(stat -f%m "$cache" 2>/dev/null || echo 0) )) -lt 3600 ]; then
    cat "$cache"
    return
  fi
  # HF inference API — text-generation models available for Pro
  curl -s "https://api-inference.huggingface.co/v1/models?task=text-generation&limit=200" \
    -H "Authorization: Bearer $HF_TOKEN" \
    2>/dev/null \
  | jq -r '.[] | "[HF] \(.id)\t\(.pipeline_tag // "")"' 2>/dev/null \
  | tee "$cache"
}

# ── Fetch local Ollama models ──────────────────────────────────
_lm_ollama_models() {
  if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    return
  fi
  curl -s http://localhost:11434/api/tags \
  | jq -r '.models[] | "[LOCAL] \(.name)\t\(.size | . / 1073741824 | floor)GB"' 2>/dev/null
}

# ── Core picker ───────────────────────────────────────────────
_lm_pick() {
  local query="$1"
  local provider="$2"   # "or" | "hf" | "local" | "" (all)
  local lines=""

  case "$provider" in
    or)    lines=$(_lm_openrouter_models) ;;
    hf)    lines=$(_lm_hf_models) ;;
    local) lines=$(_lm_ollama_models) ;;
    *)
      # All providers in parallel
      lines=$(
        { _lm_openrouter_models & _lm_hf_models & _lm_ollama_models & wait; } 2>/dev/null
      )
      ;;
  esac

  if [ -z "$lines" ]; then
    echo "No models found. Check credentials / Ollama daemon." >&2
    return 1
  fi

  # fzf with preview — columns: tag | model-id | metadata
  local selected
  selected=$(echo "$lines" \
    | column -t -s $'\t' \
    | fzf --prompt="model > " \
          --query="$query" \
          --height=60% \
          --layout=reverse \
          --border=rounded \
          --header="  [OR]=OpenRouter  [HF]=HuggingFace  [LOCAL]=Ollama  |  Enter to select" \
          --preview-window=hidden \
    | awk '{print $2}')    # extract model id (second column after tag)

  echo "$selected"
}

# ── Apply selection ───────────────────────────────────────────
_lm_apply() {
  local model_id="$1"
  [ -z "$model_id" ] && return 1

  # Determine provider from prefix tag (already stripped from id)
  # Re-detect by checking what was selected
  if [[ "$model_id" == *"/"* ]] && ollama list 2>/dev/null | grep -q "^$model_id"; then
    # Slash name but exists in Ollama
    export LM_PROVIDER="ollama"
    export AI_BASE_URL="http://localhost:11434/v1/"
    export API_KEY="ollama"
  elif curl -s http://localhost:11434/api/tags 2>/dev/null | jq -r '.models[].name' | grep -q "^$model_id"; then
    export LM_PROVIDER="ollama"
    export AI_BASE_URL="http://localhost:11434/v1/"
    export API_KEY="ollama"
  elif [[ "$model_id" == *"/"* ]] && [[ -n "$HF_TOKEN" ]]; then
    # Slash model, not local — could be HF or OpenRouter
    # Try to detect: OR models typically have provider/name format like "openai/gpt-4o"
    # HF models are "org/model-name" without provider prefixes like openai/anthropic
    local or_providers="openai|anthropic|google|meta-llama|mistralai|cohere|perplexity|deepseek|01-ai|qwen|x-ai|microsoft|amazon"
    if echo "$model_id" | grep -qE "^($or_providers)/"; then
      export LM_PROVIDER="openrouter"
      export AI_BASE_URL="https://openrouter.ai/api/v1/"
      export API_KEY="$OPENROUTER_API_KEY"
    else
      export LM_PROVIDER="huggingface"
      export AI_BASE_URL="https://api-inference.huggingface.co/v1/"
      export API_KEY="$HF_TOKEN"
    fi
  else
    # Fallback: if OR key set, use OR
    if [ -n "$OPENROUTER_API_KEY" ]; then
      export LM_PROVIDER="openrouter"
      export AI_BASE_URL="https://openrouter.ai/api/v1/"
      export API_KEY="$OPENROUTER_API_KEY"
    else
      export LM_PROVIDER="huggingface"
      export AI_BASE_URL="https://api-inference.huggingface.co/v1/"
      export API_KEY="$HF_TOKEN"
    fi
  fi

  export AI_MODEL="$model_id"

  # Persist for new shells
  echo "$LM_PROVIDER|$AI_BASE_URL|$AI_MODEL" > "$HOME/.config/lm/.active"

  echo ""
  echo "  ✓ Active: $AI_MODEL"
  echo "    Provider: $LM_PROVIDER"
  echo "    Base URL: $AI_BASE_URL"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────
lm() {
  case "$1" in

    ping)
      [ -z "$AI_MODEL" ] && { echo "No model active. Run: lm"; return 1; }
      echo "Testing $AI_MODEL..."
      local resp
      resp=$(curl -s "${AI_BASE_URL}chat/completions" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"model\":\"$AI_MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with only the word PONG\"}],\"max_tokens\":10}" \
        2>/dev/null)
      echo "$resp" | python3 -c "
import sys, json
try:
    r = json.load(sys.stdin)
    print('  ✓', r['choices'][0]['message']['content'].strip())
except:
    print('  ✗ Bad response:', sys.stdin.read()[:200])
" 2>/dev/null || echo "  ✗ No response. Check: credentials, model availability, Ollama daemon"
      ;;

    pull)
      echo "Ollama model name (e.g. llama3.2, qwen2.5:14b, phi4, gemma3:12b):"
      read -r model_name
      ollama pull "$model_name"
      ;;

    status)
      echo ""
      echo "  Active model : ${AI_MODEL:-none}"
      echo "  Provider     : ${LM_PROVIDER:-unset}"
      echo "  Base URL     : ${AI_BASE_URL:-unset}"
      echo ""
      if command -v ollama &>/dev/null && curl -s http://localhost:11434/api/tags &>/dev/null; then
        echo "  Local models (Ollama):"
        ollama list 2>/dev/null | tail -n +2 | awk '{printf "    %s\n", $1}'
      else
        echo "  Ollama: not running  (start with: ollama serve)"
      fi
      echo ""
      ;;

    chat)
      [ -z "$AI_MODEL" ] && { echo "No model active. Run: lm"; return 1; }
      if [ "$LM_PROVIDER" = "ollama" ]; then
        llm -m "ollama/$AI_MODEL" chat 2>/dev/null \
          || ollama run "$AI_MODEL"
      else
        llm chat \
          --model "$AI_MODEL" \
          --option base_url "$AI_BASE_URL" \
          --option api_key "$API_KEY" 2>/dev/null \
        || echo "llm chat not available for this provider. Use curl or your app directly."
      fi
      ;;

    -r)   shift; selected=$(_lm_pick "$*" "or");    _lm_apply "$selected" ;;
    -h)   shift; selected=$(_lm_pick "$*" "hf");    _lm_apply "$selected" ;;
    -l)          selected=$(_lm_pick ""   "local");  _lm_apply "$selected" ;;

    "")
      selected=$(_lm_pick "" "")
      _lm_apply "$selected"
      ;;

    *)
      # Treat argument as search query — pick from all
      selected=$(_lm_pick "$*" "")
      _lm_apply "$selected"
      ;;

  esac
}

# ── Restore last active model on shell start ──────────────────
if [ -f "$HOME/.config/lm/.active" ]; then
  IFS='|' read -r _p _b _m < "$HOME/.config/lm/.active"
  export LM_PROVIDER="$_p"
  export AI_BASE_URL="$_b"
  export AI_MODEL="$_m"
  [ -n "$OPENROUTER_API_KEY" ] && export API_KEY="$OPENROUTER_API_KEY"
  [ "$_p" = "huggingface" ] && export API_KEY="$HF_TOKEN"
  [ "$_p" = "ollama" ]       && export API_KEY="ollama"
fi

SWITCHER

chmod +x "$HOME/.config/lm/switch.sh"
ok "Switcher written to ~/.config/lm/switch.sh"

# ── 4. Wire into shell ───────────────────────────────────────
for rc in ~/.zshrc ~/.bash_profile; do
  if [ -f "$rc" ] && ! grep -q "lm/switch.sh" "$rc"; then
    {
      echo ""
      echo "# lm — Universal LLM Switcher"
      echo 'source "$HOME/.config/lm/switch.sh"'
    } >> "$rc"
    ok "Sourced in $rc"
  fi
done

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Done. Restart terminal or:"
echo "  source ~/.config/lm/switch.sh"
echo ""
echo "  lm                — fuzzy-pick any model from all providers"
echo "  lm gpt            — search for gpt models"
echo "  lm -r llama       — OpenRouter only, search 'llama'"
echo "  lm -h qwen        — HuggingFace only, search 'qwen'"
echo "  lm -l             — local Ollama models only"
echo "  lm ping           — test active model"
echo "  lm pull           — pull a new local model"
echo "  lm status         — show active + all local models"
echo "  lm chat           — terminal chat with active model"
echo "══════════════════════════════════════════════════════"