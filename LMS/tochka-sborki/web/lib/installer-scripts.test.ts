import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const sh  = readFileSync(new URL('../public/install.sh',  import.meta.url), 'utf8')
const ps1 = readFileSync(new URL('../public/install.ps1', import.meta.url), 'utf8')

describe('install.sh', () => {
  it('bash shebang + строгий режим', () => {
    expect(sh.startsWith('#!/usr/bin/env bash')).toBe(true)
    expect(sh).toContain('set -euo pipefail')
  })
  it('ставит node, git и Claude Code через brew/apt', () => {
    expect(sh).toContain('@anthropic-ai/claude-code')
    expect(sh).toMatch(/brew/)
    expect(sh).toMatch(/apt/)
    expect(sh).toMatch(/ensure_git/)
  })
  it('есть doctor-блок и нет плейсхолдеров', () => {
    expect(sh).toMatch(/doctor/i)
    expect(sh).not.toMatch(/TODO|FIXME|PLACEHOLDER/)
  })
})

describe('install.ps1', () => {
  it('строгий режим + winget', () => {
    expect(ps1).toContain("$ErrorActionPreference = 'Stop'")
    expect(ps1).toContain('winget')
  })
  it('ставит node, git и Claude Code', () => {
    expect(ps1).toContain('OpenJS.NodeJS.LTS')
    expect(ps1).toContain('Git.Git')
    expect(ps1).toContain('@anthropic-ai/claude-code')
  })
  it('нет плейсхолдеров', () => {
    expect(ps1).not.toMatch(/TODO|FIXME|PLACEHOLDER/)
  })
})
