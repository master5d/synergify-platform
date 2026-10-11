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
  it('режим России: --ru или GFW_REGION=ru пишет GigaChat вместо Gemini', () => {
    expect(sh).toContain('--ru')
    expect(sh).toContain('GFW_REGION')
    expect(sh).toContain('gigachat/GigaChat-2-Lite')
    expect(sh).toContain('GIGACHAT_CREDENTIALS')
  })
})

// LiteLLM ≥ 1.105 не стартует без master key (проверено 2026-10-11): start-скрипты создают его в .env
// и слушают только 127.0.0.1, а подсказка ведёт Aider с этим ключом, а не «любым значением».
describe('install-gfw: master key и localhost', () => {
  it('sh', () => {
    expect(sh).toContain('LITELLM_MASTER_KEY')
    expect(sh).toContain('--host 127.0.0.1')
    expect(sh).not.toMatch(/любое значение/)
  })
  it('ps1', () => {
    expect(ps1).toContain('LITELLM_MASTER_KEY')
    expect(ps1).toContain('--host 127.0.0.1')
    expect(ps1).not.toMatch(/любое значение/)
  })
})

// ssl_verify: false выключает проверку сертификата — допустим только в блоке GigaChat (u3, шаг 2б).
function sslOffOutsideGigachat(src: string): string[] {
  const blocks = src.split(/\n(?=\s*- model_name:)/)
  return blocks.filter((b) => /ssl_verify:\s*false/.test(b) && !/gigachat\//.test(b))
}

describe('install-gfw: ssl_verify только у GigaChat', () => {
  it('sh', () => expect(sslOffOutsideGigachat(sh)).toEqual([]))
  it('ps1', () => expect(sslOffOutsideGigachat(ps1)).toEqual([]))
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
  it('режим России: $env:GFW_REGION = ru пишет GigaChat вместо Gemini', () => {
    expect(ps1).toContain('GFW_REGION')
    expect(ps1).toContain('gigachat/GigaChat-2-Lite')
    expect(ps1).toContain('GIGACHAT_CREDENTIALS')
  })
})
