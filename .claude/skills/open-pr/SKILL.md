---
name: open-pr
description: Use this skill when the user asks to open/create a PR for the current branch (e.g. "crear el PR", "abrir el PR", "hace el PR de esta rama"). Pushes the branch, creates the GitHub PR using .github/pull_request_template.md, assigns the right milestone, then runs the changelog-cod skill and pushes the resulting changelog commit (if any) so the PR is fully ready in one pass.
user-invocable: true
---

# open-pr

End-to-end PR creation for this repo: push → create PR from the repo's template → assign
milestone → run `changelog-cod` → commit + push the changelog entry (if the PR is big enough
to need one). Invoking this skill is the user's authorization to push and open the PR — don't
ask for confirmation on those specific actions, but do stop and ask when a step is genuinely
ambiguous (see below).

## Preconditions

- Must be on a feature branch, not `main`/`master`. Refuse (and tell the user why) if HEAD is
  on the base branch.
- The branch's commits should already exist locally. If `git status` shows uncommitted changes,
  stop and ask the user whether/how to commit them first — don't guess a commit message for
  unrelated work and don't fold it silently into the PR.
- If the branch has no commits ahead of `origin/<base>` at all, there's nothing to open a PR
  for — say so and stop.

## Steps

1. **Determine the base branch.** Default `main`. Only ask if it's genuinely unclear (e.g. the
   branch was clearly forked from something else).

2. **Push.** `git push -u origin <branch>` (first push) or `git push` (already tracking).

3. **Pick the milestone.**
   - Read `CHANGELOG.md`. The current milestone is the topmost `## vX.Y.Z` heading with **no**
     trailing date (dated ones are already released — see `changelog-cod`'s rule for the exact
     heading format).
   - Find the highest `CODn-XXX` in that section.
   - If the highest number is **below 18**: use this milestone as-is. Match it to an existing
     open GitHub milestone via `gh api repos/{owner}/{repo}/milestones --jq '.[].title'` (title
     is just the version, e.g. `0.10.0`).
   - If it's **18 or above**: this milestone is considered full. Don't silently bump the version
     or create a new GitHub milestone — ask the user whether to open the PR against the next
     milestone (and whether that milestone already exists on GitHub or needs creating).

4. **Build the PR title and body.**
   - Title: a conventional-commit-style one-liner summarizing the change (matches the style of
     existing merged PRs — see `git log --oneline` for examples), not necessarily identical to
     the local commit subject.
   - Body: fill `.github/pull_request_template.md` section by section based on
     `git diff origin/<base>...HEAD`:
     - Backend/Frontend bullets: only fill the areas that actually changed (Creator/Locations/
       Travels/Visits, Backend endpoints/business rules); leave the rest as the template's blank
       placeholder.
     - **Checklist — do not check a box unless it was actually verified in this session**:
       - "Verifiqué la vista mobile": only check if a mobile viewport was actually exercised
         (e.g. via Playwright) during this session — not just because the CSS looks responsive.
       - "La build de Docker funciona correctamente": only check if `docker compose up --build`
         (or equivalent) was actually run this session against these changes.
       - "Los tests E2E de Playwright pasan localmente": only check if the E2E suite was
         actually run; a manual Playwright MCP spot-check is not the same thing.
       - "Actualicé el Changelog...": leave unchecked here — step 6 below determines the real
         answer after `changelog-cod` runs, and this step happens *after* PR creation, so update
         the PR body afterwards (`gh pr edit --body`) if the checklist needs to flip to checked.
       - "Asigné el milestone...": check this one, since step 3 guarantees it before creation.

5. **Create the PR.**
   ```
   gh pr create --base <base> --head <branch> --title "<title>" --milestone "<milestone>" --body "<body>"
   ```
   Capture the PR number/URL from the output.

6. **Run `changelog-cod`.** Invoke it now (via the Skill tool), against the same base branch.
   Because the branch is already pushed, its `origin/<base>...HEAD` size calc will match exactly
   what `pr-compliance.yml` computes once the PR is opened. Let it decide whether `CHANGELOG.md`
   needs an entry — don't duplicate its logic here.

7. **If `changelog-cod` modified `CHANGELOG.md`:** commit that single-file change (e.g.
   `chore: update changelog for #<PR number>`) and push it to the same branch — this updates the
   already-open PR automatically. If it modified nothing (PR size < 100), skip this step and say
   so.

8. **If step 4's checklist left "Actualicé el Changelog" unchecked but step 7 did update it:**
   `gh pr edit <number> --body` with that box now checked, so the PR body reflects reality.

9. **Report back:** PR URL, milestone assigned, and whether a changelog entry was added (with
   the exact line), plus which checklist items are still unchecked and why (so the user knows
   what's left before merge — e.g. E2E tests, API docs).

## What this skill does not do

- Doesn't run `docker compose up --build` itself — that's a separate, heavier action the user
  asks for explicitly when they want it verified locally.
- Doesn't create GitHub milestones on its own — that's a shared/visible action, always confirm
  with the user first (see step 3).
- Doesn't touch `CHANGELOG.md` directly — that's entirely delegated to `changelog-cod`, the only
  skill allowed to write to that file (see root `CLAUDE.md`).
