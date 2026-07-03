---
name: changelog-cod
description: Use this skill when the user asks to update CHANGELOG.md for a PR, compute the "PR size" / COD number, or says things like "actualizar el changelog", "calcular el COD", "agregar entrada al changelog". Computes the PR size using the exact formula from .github/workflows/pr-compliance.yml, and appends a COD entry to the current (undated) milestone section in CHANGELOG.md. This is the one sanctioned exception to CLAUDE.md's "never edit CHANGELOG.md" rule — only this skill may write to that file.
user-invocable: true
---

# changelog-cod

Computes a PR's "size" the same way `.github/workflows/pr-compliance.yml` does, and — if the
PR is large enough to require it — appends the next `CODn-XXX` entry to `CHANGELOG.md` under
the current milestone.

## Why this exists

`CHANGELOG.md` is normally hands-off (see root `CLAUDE.md`): entries are filled in manually
by PR number/subject, and Claude must never edit it outside of this flow. This skill is the
one sanctioned exception — it replaces manual guessing with the exact rule the team already
enforces in CI, so the number in the changelog always matches what `pr-compliance.yml` would
compute for that PR.

## The rule

1. **PR size** — from `.github/workflows/pr-compliance.yml`, step "Validate CHANGELOG.md":
   ```bash
   STATS=$(git diff origin/<base>...HEAD --stat)
   NUM_ARR=($(echo "$STATS" | tail -n 1 | grep -oE '[0-9]+'))
   PRODUCT=1
   for num in "${NUM_ARR[@]}"; do PRODUCT=$((PRODUCT * num)); done
   SIZE=$(awk "BEGIN { print int(sqrt($PRODUCT)) }")
   ```
   `NUM_ARR` is every integer in the last line of `git diff --stat` (files changed, insertions,
   deletions — deletions may be absent). `SIZE` is `floor(sqrt(files × insertions × deletions))`.
   This must be run against the same base the PR actually targets (normally `main`), using
   `origin/<base>` so it matches what CI sees — fetch first if local remote-tracking refs are stale.

2. **Threshold** — if `SIZE < 100`, the PR is considered too small to log. **Do not touch
   `CHANGELOG.md`.** Report the computed size and stop.

3. **COD increment** — if `SIZE >= 100`:
   ```
   increment = floor(SIZE / 100)   # bash: $(( SIZE / 100 )), integer division truncates already
   ```

4. **Target milestone section** — in `CHANGELOG.md`, milestone headings look like `## v0.10.0`
   (in progress / current — no date) or `## v0.8.0 (2026-04-17)` (already released — has a date).
   The **current** milestone is the first (topmost) `## vX.Y.Z` heading with **no trailing date**.
   Its COD prefix is the version's minor number: `v0.10.0` → `COD10`, `v0.9.0` → `COD9`.

5. **Next COD number** — within that milestone's section (from its heading down to the next
   `## ` heading), find every `CODn-XXX` line and take the max `XXX`. The new entry's number is:
   ```
   new_num = max_existing_XXX + increment
   ```
   Zero-pad to match the existing width (3 digits today, e.g. `009`, `042`; widen only if a
   number would overflow it).

6. **Entry text** — via `gh pr view --json title,number` on the current branch (fall back to
   asking the user only if there's no open PR to read from). Strip a leading conventional-commit
   type (`feat: `, `fix: `, `chore: `, etc.) from the title to match the existing style — entries
   read as a plain capitalized description, not a conventional-commit subject. Format:
   ```
   - CODn-XXX: <Description> (#<PR number>) [<SIZE>]
   ```

7. **Insert** the new line as the **last** entry in that milestone's list (right before the next
   blank line, subsection heading like `### Internationalization`, or the next `## ` milestone
   heading — whichever comes first). Don't reorder or touch any other line.

## Steps to execute

1. Determine the base branch (default `main`; ask only if the PR clearly targets something else).
2. `git fetch origin <base> --quiet` to make sure `origin/<base>` is current.
3. Run the exact `STATS`/`NUM_ARR`/`PRODUCT`/`SIZE` snippet from the rule above against
   `origin/<base>...HEAD`.
4. If `SIZE < 100`: tell the user the size and that no changelog entry is needed. Stop here.
5. Compute `increment`, read `CHANGELOG.md`, locate the current (undated) milestone section and
   its COD prefix, find `max_existing_XXX`, compute `new_num`.
6. Get the PR title/number with `gh pr view --json title,number` (current branch). If that fails
   (no PR yet, detached HEAD, etc.), ask the user for the description and PR number instead of
   guessing.
7. Edit `CHANGELOG.md`: insert the new `- CODn-XXX: ... (#N) [SIZE]` line at the end of the
   current milestone's entries.
8. Show the user the resulting diff (`git diff CHANGELOG.md`) and a one-line summary: size,
   increment, and the new COD number assigned.

## Notes / edge cases

- If there are multiple undated `## v` headings (shouldn't normally happen), use the topmost one
  and flag it to the user rather than guessing silently.
- If the milestone section has no existing `CODn-XXX` entries yet, `max_existing_XXX` is `0`
  (i.e. the new entry starts at `increment`, zero-padded).
- Never run this against uncommitted/unpushed changes only — the size calc reads `origin/<base>`,
  so make sure the branch's commits are pushed first (or diff will be against a stale/missing ref).
- This skill only ever appends one line to `CHANGELOG.md`. It never edits or reorders any other
  content in the file, and never touches any other file.
