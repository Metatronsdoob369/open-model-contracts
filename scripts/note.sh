#!/usr/bin/env bash
set -euo pipefail

# Quick note helper (no editor). Writes to notes/ with timestamped filename.
# Usage:
#   scripts/note.sh conversation "short-title" "your text here"
#   scripts/note.sh idea "short-title" "your text here"
#   scripts/note.sh research "slug" "summary text"   # drops into summaries as .md stub
#
# It appends if the file already exists.

if [ $# -lt 3 ]; then
  echo "Usage: $0 {conversation|idea|research} slug \"text...\"" >&2
  exit 1
fi

TYPE="$1"
SLUG="$2"
TEXT="$3"
DATE="$(date +%Y-%m-%d)"

case "$TYPE" in
  conversation)
    DIR="notes/conversations"
    FILE="$DIR/${DATE}-${SLUG}.md"
    HEADER="# ${DATE} — ${SLUG//-/ }"
    ;;
  idea)
    DIR="notes/ideas"
    FILE="$DIR/${SLUG}.md"
    HEADER="# ${SLUG//-/ }"
    ;;
  research)
    DIR="notes/research/summaries"
    FILE="$DIR/${SLUG}.md"
    HEADER="# ${SLUG//-/ }"
    ;;
  *)
    echo "Type must be conversation, idea, or research" >&2
    exit 1
    ;;
esac

mkdir -p "$DIR"

if [ ! -s "$FILE" ]; then
  printf "%s\n\n" "$HEADER" > "$FILE"
fi

printf "%s\n\n" "$TEXT" >> "$FILE"

echo "Wrote: $FILE"
