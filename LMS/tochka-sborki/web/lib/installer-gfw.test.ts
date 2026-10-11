import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const sh  = readFileSync(new URL('../public/install-gfw.sh',  import.meta.url), 'utf8')
const ps1 = readFileSync(new URL('../public/install-gfw.ps1', import.meta.url), 'utf8')

describe('install-gfw.sh', () => {
  it('bash shebang + строгий режим', () => {
    expect(sh.startsWith('#!/usr/bin/env bash')).toBe(true)
    expect(sh).toContain('set -euo pipefail')
  })
  it('ставит litellm, config на :4000 с cerebras/gemini', () => {
    expect(sh).toMatch(/litellm/)
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

// LiteLLM ≥ 1.105 не стартует без master key (проверено 2026-10-11): установщик кладёт его в .env,
// start-скрипты слушают только 127.0.0.1, и подсказки не предлагают «любое значение» вместо ключа.
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

// Агент стека — Hermes (агент автора курса), а не Aider/Cline, которых у автора нет (решение владельца
// 2026-10-11). Hermes ставится только официальным установщиком Nous Research (pip-сборку он запрещает)
// и подключается к локальному шлюзу как custom-провайдер с ключом из LITELLM_MASTER_KEY.
describe('install-gfw: Hermes вместо Aider/Cline', () => {
  for (const [name, src] of [['sh', sh], ['ps1', ps1]] as const) {
    it(`${name}: официальный установщик Hermes, без интерактива`, () => {
      expect(src).toContain('https://hermes-agent.nousresearch.com/install.')
      expect(src).toMatch(/--non-interactive|-NonInteractive/)
    })
    it(`${name}: Hermes подключается к шлюзу`, () => {
      expect(src).toContain('config set model.provider custom')
      expect(src).toContain('config set model.base_url http://127.0.0.1:4000/v1')
      expect(src).toContain('config set model.key_env LITELLM_MASTER_KEY')
    })
    it(`${name}: нет Aider и Cline`, () => {
      expect(src).not.toMatch(/\baider\b|\bcline\b/i)
    })
  }
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
  it('ставит litellm, config :4000 cerebras/gemini', () => {
    expect(ps1).toMatch(/litellm/)
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
