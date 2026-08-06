import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const sh  = readFileSync(new URL('../public/install-gfw.sh',  import.meta.url), 'utf8')
const ps1 = readFileSync(new URL('../public/install-gfw.ps1', import.meta.url), 'utf8')

describe('install-gfw.sh', () => {
  it('bash shebang + строгий режим', () => {
    expect(sh.startsWith('#!/usr/bin/env bash')).toBe(true)
    expect(sh).toContain('set -euo pipefail')
  })
  it('ставит litellm+aider, config на :4000 с cerebras/gemini', () => {
    expect(sh).toMatch(/litellm/)
    expect(sh).toMatch(/aider/)
    expect(sh).toMatch(/config\.yaml/)
    expect(sh).toContain('4000')
    expect(sh).toMatch(/cerebras/)
    expect(sh).toMatch(/gemini/)
  })
  it('doctor-блок и нет плейсхолдеров', () => {
    expect(sh).toMatch(/doctor/i)
    expect(sh).not.toMatch(/TODO|FIXME|PLACEHOLDER/)
  })
})

describe('install-gfw.ps1', () => {
  it('строгий режим + winget', () => {
    expect(ps1).toContain("$ErrorActionPreference = 'Stop'")
    expect(ps1).toContain('winget')
  })
  it('ставит litellm+aider, config :4000 cerebras/gemini', () => {
    expect(ps1).toMatch(/litellm/)
    expect(ps1).toMatch(/aider/)
    expect(ps1).toContain('4000')
    expect(ps1).toMatch(/cerebras/)
    expect(ps1).toMatch(/gemini/)
  })
  it('нет плейсхолдеров', () => {
    expect(ps1).not.toMatch(/TODO|FIXME|PLACEHOLDER/)
  })
})
