# AGENTS.md: project rules

> One rules file for any agent. Codex, Antigravity and Hermes read it on their own,
> Gemini CLI through the setting in `.gemini/settings.json`, Claude Code through `CLAUDE.md`
> (a single line there: `@AGENTS.md`). Edit only this file.
> Keep it short: under ~200 lines (lesson 05/u3). Replace the `[...]` brackets with your own words.

## Who I am
[Role, experience, what I can do myself. For example: "marketer, 5 years in B2B, I don't write code but I can read it"]

## Project
[What it is and why. Who will use it]

## Stack
- [Language, framework, services. Don't know yet? Leave it empty, you'll fill it in during module 03]

## Folder structure
- `my-experiments/`: course practice results, one file per practice
- `my-templates/`: proven templates and prompts
- `hooks/`: the script the agent runs at session start
- [`src/`: project code, once there is some]

## How to run
[A command to run or check the project. For example: `npm install && npm run dev`]

## What I delegate to the agent
- [Drafts, code from a description, tests, documentation]

## What I decide myself
- [Architecture, what to publish, the final check]

## Memory between sessions
- At session start, read `STATE.md` and the "Now" section of `TODO.md`.
  If the hook already showed their contents, don't read them a second time.
- When I say "save the state" or we wrap up, update `STATE.md`: what's done,
  where we stopped, what's blocking, which decisions we made. Keep it short, no retelling of the whole session.
- Keep tasks in `TODO.md`: move finished ones to "Done".
- If you made a mistake and I corrected you, propose a rule for the "Rules" section below.

## Rules
- Work only inside this folder.
- Before a big change (more than one file, or a deletion) show a plan and wait for "yes".
- Don't write keys, passwords or tokens into project files and don't show them in answers.
  They live in `.env`, and `.env` is already in `.gitignore`.
- Don't run commands as administrator (`sudo`, "Run as administrator").
- Save a course practice result to `my-experiments/` under the name the lesson gives.
- [Your rule after a corrected agent mistake]

## What to avoid
- [For example: "don't change the folder structure without asking"]
