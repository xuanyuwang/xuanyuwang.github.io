#!/usr/bin/env bash
set -euo pipefail

source_repo="${1:-../knowledge}"
target_dir="src/content/blog"

find_source_dir() {
  local root="$1"
  local base_name
  base_name="$(basename "${root}")"

  if [ -d "${root}" ] && [[ "${base_name}" == "blog" || "${base_name}" == "blogs" ]] && compgen -G "${root}/*.md" > /dev/null; then
    echo "${root}"
    return 0
  fi

  local candidates=(
    "${root}/blogs"
    "${root}/blog"
    "${root}/content/blog"
    "${root}/dist/blog"
    "${root}/out/blog"
  )

  for candidate in "${candidates[@]}"; do
    if [ -d "${candidate}" ] && compgen -G "${candidate}/*.md" > /dev/null; then
      echo "${candidate}"
      return 0
    fi
  done

  return 1
}

if ! source_dir="$(find_source_dir "${source_repo}")"; then
  echo "No markdown source directory found under: ${source_repo}"
  echo "Checked: root, blogs, blog, content/blog, dist/blog, out/blog"
  exit 1
fi

mkdir -p "${target_dir}"

rsync -a \
  --prune-empty-dirs \
  --include='*/' \
  --include='*.md' \
  --exclude='*' \
  "${source_dir}/" "${target_dir}/"

echo "Imported markdown posts from ${source_dir} to ${target_dir}."
