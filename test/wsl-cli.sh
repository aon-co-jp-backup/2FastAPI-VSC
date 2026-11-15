#!/usr/bin/env bash
# Smoke-test helper: run the real 2FastAPI CLI inside WSL, translating Windows paths.
args=()
for a in "$@"; do
  case "$a" in
    [A-Za-z]:\\*|[A-Za-z]:/*) a="$(wslpath -u "$a")" ;;
  esac
  args+=("$a")
done
. "$HOME/2fa-venv/bin/activate"
PYTHONPATH=/mnt/f/2FastAPI/src python -m tofastapi "${args[@]}"
