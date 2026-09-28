# Tochka Sborki student starter

A project skeleton you can take through the whole course with any agent: Claude Code, Codex,
Antigravity, Hermes, or another one that reads `AGENTS.md`. It installs nothing, contains no keys,
and never writes to your home folder or global settings: everything lives in this folder.

## Three steps

1. **Unzip** the archive where you will work (for example, in your home folder). Rename the
   `tochka-starter` folder to whatever you like.
2. **Turn the folder into a git repository** and open it in your agent. Codex and Hermes look for
   the rules file from the git repository root, so it's best to run `git init` right away:
   ```
   cd tochka-starter
   git init
   git add .
   git commit -m "course starter"
   ```
   Then start the agent **in the root of this folder**: `claude`, `codex` or `hermes`;
   in Antigravity, open the folder as a workspace.
3. **First command to the agent:**
   ```
   Read the project rules file and STATE.md. Tell me what you now know about the project
   and ask me three questions to fill in AGENTS.md.
   ```
   Answer the questions and ask the agent to write your answers into `AGENTS.md`. That's your first step in the course.

## What's inside

| File | Why | Where in the course |
|------|-----|---------------------|
| `AGENTS.md` | **The single rules file.** Who you are, what the project is, how to work, what not to do | 02/u3, 05/u3 |
| `CLAUDE.md` | One line, `@AGENTS.md`: Claude Code imports the shared rules file | 02/u3 |
| `TODO.md` | Current tasks: now, next, done | 05/u3 |
| `STATE.md` | Memory between sessions: what's done, where you stopped, what's blocking | 05/u3, 05/u4 |
| `HYGIENE.md` | Project hygiene checklist, before the "Pendel" practice | 07/u6 |
| `my-experiments/` | Where the course asks you to save practice results | all modules |
| `my-templates/` | Proven templates: agent charter, automation recipes, feedback | 01, 08, exercises |
| `hooks/session-start.mjs` | Shows the agent `STATE.md` and `TODO.md` at session start | 07/u3 |
| `.claude/settings.json` | Wires this hook into Claude Code | 07/u3 |
| `.codex/hooks.json` | Wires the same hook into Codex | 07/u3 |
| `.gitignore` | Keeps keys (`.env`), personal agent settings and junk out of git | 07/u6 |

The course lessons (02/u3, 05/u3) build the project the same way: context and rules live in `AGENTS.md`,
and `CLAUDE.md` only imports it. A rule written into `AGENTS.md` is seen by every agent.

## What your agent reads at start

Checked against the official documentation (links below). The starter promises no more than it says.

| Agent | Rules file | Session-start hook |
|-------|------------|--------------------|
| **Claude Code** | `CLAUDE.md`, and through the line `@AGENTS.md` also `AGENTS.md`. Newer versions read `AGENTS.md` on their own, but only when there is no `CLAUDE.md` next to it; the import works in any version | Yes: `.claude/settings.json` → `SessionStart`. On first launch Claude Code asks whether you trust this folder |
| **Codex** | `AGENTS.md` (searched from the git repository root down to the current folder) | Yes: `.codex/hooks.json` → `SessionStart`. Codex runs the hook only after you trust the project and approve the hook with `/hooks` |
| **Antigravity** | `AGENTS.md` (read as workspace rules) | The starter does not rely on Antigravity hooks |
| **Hermes** | `AGENTS.md` (of `.hermes.md`, `AGENTS.md`, `CLAUDE.md` it loads the first one it finds) | No: Hermes hooks are configured in `~/.hermes/`, not in the project |

If the hook didn't fire, nothing is lost: `AGENTS.md` has the rule "at session start, read
`STATE.md` and `TODO.md`". The hook just makes it more reliable.

**A hook is a command that runs on your computer** (07/u3). Before approving it, open
`hooks/session-start.mjs`: it only reads two files and prints them. It needs Node.js, which the
installer from lesson 02/u2 sets up.

Sources:
- Claude Code, memory and `AGENTS.md`: https://code.claude.com/docs/en/memory
- Claude Code, hooks: https://code.claude.com/docs/en/hooks
- Codex, `AGENTS.md`: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex, hooks: https://learn.chatgpt.com/docs/hooks
- Antigravity, rules: https://www.antigravity.google/docs/rules
- Hermes, context files: https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files

## What the starter doesn't do

- It doesn't install the agent, Node.js or Git: the installer in lesson 02/u2 does that.
- It contains no keys or tokens. If the course asks for a key, put it into a `.env` file in this
  folder: it's already in `.gitignore` and won't get into git.
- It doesn't touch `~/.claude`, `~/.codex` or other global settings.
