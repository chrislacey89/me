#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Implementation patterns — Astro-focused list confirmed at /init-pipeline install.
IMPL_PATTERNS=("*.ts" "*.tsx" "*.astro" "*.js" "*.jsx")

MATCHED=0
for pattern in "${IMPL_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == $pattern ]]; then MATCHED=1; break; fi
done
if [ $MATCHED -eq 0 ]; then exit 0; fi

# Skip test files and type declarations (extension-agnostic)
if [[ "$FILE_PATH" == *test* || "$FILE_PATH" == *spec* || "$FILE_PATH" == *.d.ts ]]; then
  exit 0
fi
# Skip config files (drizzle.config, vite.config, etc.)
if [[ "$FILE_PATH" == *.config.* ]]; then
  exit 0
fi
# Check for classification markers
if [ ! -f "$CLAUDE_PROJECT_DIR/.claude/.tdd-active" ] && [ ! -f "$CLAUDE_PROJECT_DIR/.claude/.tdd-skipped" ]; then
  echo '{"decision":"block","reason":"BLOCKED: classify work in /execute Step 3 before writing implementation files. Either invoke /tdd (backend/behavior-heavy) or create .claude/.tdd-skipped (visual frontend)."}' >&2
  exit 2
fi
exit 0
