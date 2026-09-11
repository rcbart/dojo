#!/bin/sh
# Every gate that applies to the MCP guide, in one command.
#
# These are not in .github/workflows/pages.yml on purpose. The guide lives in
# blog/, which is gitignored and never reaches a CI checkout, so a workflow
# step pointing at it fails on a fresh clone with "no files matched". Run this
# before handing the guide to anyone, and wire these three into the workflow on
# the day the guide moves to a published path.
#
#   sh scripts/check-guide.sh
set -e
cd "$(dirname "$0")/.."

echo "== cross-references"
python3 scripts/verify-cross-refs.py blog/_mcp-auth-guide/*.md

echo "== code blocks"
python3 scripts/verify-code-blocks.py blog/_mcp-auth-guide/*.md

echo "== voice"
python3 scripts/verify-voice-content.py blog/_mcp-auth-guide/*.md

echo "== diagrams"
cd blog/_mcp-auth-guide
missing=0
for ref in $(grep -ho 'diagrams/[a-z0-9-]*\.svg' ./*.md | sort -u); do
  [ -f "$ref" ] || { echo "  MISSING $ref"; missing=1; }
done
for f in diagrams/*.svg; do
  grep -q "$(basename "$f")" ./*.md || { echo "  orphan $f"; missing=1; }
done
[ "$missing" -eq 0 ] && echo "  every diagram reference resolves, no orphans"

echo
echo "guide: all gates clean"
