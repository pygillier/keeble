#!/usr/bin/env bash
# version.sh — Semantic versioning helper for Keeble
# Usage:
#   ./scripts/version.sh              # show current version
#   ./scripts/version.sh patch        # bump patch (1.2.3 → 1.2.4)
#   ./scripts/version.sh minor        # bump minor (1.2.3 → 1.3.0)
#   ./scripts/version.sh major        # bump major (1.2.3 → 2.0.0)
#   ./scripts/version.sh 2.1.0        # set explicit version
#   ./scripts/version.sh patch --dry-run  # preview without creating tag

set -euo pipefail

# ── helpers ───────────────────────────────────────────────────────────────────

die() { echo "error: $*" >&2; exit 1; }

require_clean_tree() {
  if ! git diff --quiet HEAD; then
    die "working tree is dirty — commit or stash your changes first"
  fi
}

current_version() {
  # Latest semver tag, strip leading 'v'
  git tag --sort=-version:refname \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' \
    | head -1 \
    | sed 's/^v//' \
    || true
}

# ── main ──────────────────────────────────────────────────────────────────────

BUMP="${1:-}"
DRY_RUN=false
[[ "${2:-}" == "--dry-run" ]] && DRY_RUN=true

# Show current version when called with no arguments
if [[ -z "$BUMP" ]]; then
  CURRENT=$(current_version)
  if [[ -z "$CURRENT" ]]; then
    echo "No version tags found."
  else
    echo "Current version: v${CURRENT}"
  fi
  exit 0
fi

# Resolve current version (default to 0.0.0 if no tags yet)
CURRENT=$(current_version)
CURRENT="${CURRENT:-0.0.0}"

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

# Determine the new version
case "$BUMP" in
  major)
    NEW_VERSION="$((MAJOR + 1)).0.0"
    ;;
  minor)
    NEW_VERSION="${MAJOR}.$((MINOR + 1)).0"
    ;;
  patch)
    NEW_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
    ;;
  [0-9]*.[0-9]*.[0-9]*)
    # Explicit version — validate format
    if ! echo "$BUMP" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9._-]+)?$'; then
      die "invalid version format: '$BUMP' (expected MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-prerelease)"
    fi
    NEW_VERSION="$BUMP"
    ;;
  *)
    die "unknown bump type: '$BUMP' (use: major | minor | patch | X.Y.Z)"
    ;;
esac

TAG="v${NEW_VERSION}"

echo "Current : v${CURRENT}"
echo "New     : ${TAG}"

if $DRY_RUN; then
  echo "(dry-run) tag '${TAG}' would be created — no changes made"
  exit 0
fi

require_clean_tree

# Confirm before tagging
read -rp "Create and push tag '${TAG}'? [y/N] " CONFIRM
case "$CONFIRM" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Aborted."; exit 0 ;;
esac

git tag -a "$TAG" -m "Release ${TAG}"
echo "Tag '${TAG}' created locally."

read -rp "Push '${TAG}' to origin? [y/N] " PUSH_CONFIRM
case "$PUSH_CONFIRM" in
  [yY]|[yY][eE][sS])
    git push origin HEAD --tags
    echo "Branch and tag '${TAG}' pushed — the release workflow will now run on GitHub Actions."
    ;;
  *)
    echo "Tag created locally only. Push it later with: git push origin ${TAG}"
    ;;
esac
