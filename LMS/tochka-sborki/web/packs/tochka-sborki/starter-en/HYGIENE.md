# Project hygiene: checklist

Go through it once a month, or when working with the agent starts to feel harder. The full agent audit and
its prompt are in the "Pendel" practice (lesson 07/u6). The rule from there: of everything you find, fix
**three** items, one at a time, with a commit after each; the rest goes to `TODO.md`.

Before you start: `git status` must be clean.

## 1. File size and monoliths
- [ ] No files that mix several responsibilities (logic, markup, styles in one)
- [ ] You know the longest files in the project and understand why they are that long

## 2. Mixed layers
- [ ] Styles and scripts live separately, not inside HTML or templates

## 3. Agent settings
- [ ] `.claude/settings.json`, `.codex/` and the MCP config have no outdated permissions or duplicates
- [ ] No absolute paths to other people's folders
- [ ] No keys or tokens in plain text, only in `.env`

## 4. Rules file
- [ ] `AGENTS.md` is shorter than ~200 lines
- [ ] It has no contradictions or outdated instructions
- [ ] `CLAUDE.md` still only imports `AGENTS.md`

## 5. Memory between sessions
- [ ] `STATE.md` was updated after the last working session
- [ ] From `STATE.md` and `TODO.md` a new session understands what's done and what's next

## 6. Hooks
- [ ] You know what each project hook does (a hook runs a command on your computer)
- [ ] Hooks you no longer need are removed

## 7. Git
- [ ] `.env` and personal agent settings are not in git: `git ls-files` doesn't list them
- [ ] The last commit is not older than the last working session

Save the result to `my-experiments/u6-pendel.md` (the template is in lesson 07/u6).
