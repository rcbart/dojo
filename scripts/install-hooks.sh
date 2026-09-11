#!/bin/sh
# Install the repository's git hooks. Run once per clone.
#
#   sh scripts/install-hooks.sh
#
# Why this exists. The pre-push hook that refuses to push private notes lives in
# .git/hooks/, and .git/hooks/ is not part of the repository: it is created
# fresh and empty by `git clone`. So the one safety net standing between a
# local-only file and origin exists on exactly one machine, and a new clone, a
# restored backup or a second laptop silently has no protection at all.
#
# Keeping the hook in version control and installing it deliberately fixes that.
# The hook names the private files, but so does .gitignore, which is already
# committed, so this discloses nothing new.
set -e
cd "$(dirname "$0")/.."

mkdir -p .git/hooks
cp scripts/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
echo "installed .git/hooks/pre-push"

# Prove it is live rather than assuming it.
if [ -x .git/hooks/pre-push ]; then
  echo "hook is executable and will run on the next push."
else
  echo "WARNING: hook is present but not executable." >&2
  exit 1
fi
