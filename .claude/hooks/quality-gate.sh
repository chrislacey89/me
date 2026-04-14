#!/bin/bash
# Quality gate — runs after each Write/Edit to catch issues early.
# Only runs on TypeScript/JavaScript/Astro implementation files. Skips test/config files.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only gate implementation files
if [[ ! "$FILE_PATH" == *.ts && ! "$FILE_PATH" == *.tsx && ! "$FILE_PATH" == *.js && ! "$FILE_PATH" == *.jsx && ! "$FILE_PATH" == *.astro ]]; then
  exit 0
fi
# Skip test files, type declarations, config files
if [[ "$FILE_PATH" == *test* || "$FILE_PATH" == *spec* || "$FILE_PATH" == *.d.ts || "$FILE_PATH" == *.config.* ]]; then
  exit 0
fi

# Biome check (format + lint). No test/tsc scripts in this project.
BIOME_OUTPUT=$(pnpm biome check "$FILE_PATH" 2>&1)
BIOME_EXIT=$?

if [ $BIOME_EXIT -ne 0 ]; then
  echo "Biome errors found:" >&2
  echo "$BIOME_OUTPUT" >&2
  exit 2
fi

exit 0
