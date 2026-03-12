#!/usr/bin/env bash
set -euo pipefail

if ! command -v typst >/dev/null 2>&1; then
  echo "typst CLI not found. Install Typst first: https://typst.app/docs/reference/cli/"
  exit 1
fi

mkdir -p public/typst
shopt -s nullglob

sources=(typst/*.typ)
if [ ${#sources[@]} -eq 0 ]; then
  echo "No Typst files found in ./typst"
  exit 0
fi

for source in "${sources[@]}"; do
  base="$(basename "${source}" .typ)"
  target="public/typst/${base}.pdf"
  echo "Building ${source} -> ${target}"
  typst compile "${source}" "${target}"
done

echo "Typst build complete."
