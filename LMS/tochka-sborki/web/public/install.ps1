#Requires -Version 5
# Точка Сборки — установщик базового agentic stack (Windows 11)
# Ставит: Node.js LTS + Git + Claude Code. Идемпотентно.
# Использование: irm https://ai.mamaev.coach/install.ps1 | iex

$ErrorActionPreference = 'Stop'
$GuideUrl = 'https://ai.mamaev.coach/lessons/02-setup-guide'

function Info($m) { Write-Host "▸ $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "✓ $m" -ForegroundColor Green }
function Fail($m) { Write-Host "✗ $m" -ForegroundColor Red; exit 1 }
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Update-SessionPath {
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [System.Environment]::GetEnvironmentVariable('Path','User')
}

Write-Host "Точка Сборки — установка agentic stack`n" -ForegroundColor Cyan

if (-not (Have 'winget')) {
  Fail "winget не найден. Обнови «App Installer» из Microsoft Store, затем повтори. Ручной гайд: $GuideUrl"
}

if (Have 'node') { Ok "Node.js уже установлен ($(node -v))" }
else {
  Info "Устанавливаю Node.js LTS…"
  winget install --silent --accept-package-agreements --accept-source-agreements --id OpenJS.NodeJS.LTS
  Update-SessionPath
  if (Have 'node') { Ok "Node.js установлен ($(node -v))" } else { Fail "Не удалось установить Node.js. Гайд: $GuideUrl" }
}

if (Have 'git') { Ok "Git уже установлен ($(git --version))" }
else {
  Info "Устанавливаю Git…"
  winget install --silent --accept-package-agreements --accept-source-agreements --id Git.Git
  Update-SessionPath
  if (Have 'git') { Ok "Git установлен" } else { Fail "Не удалось установить Git. Гайд: $GuideUrl" }
}

if (Have 'claude') { Ok "Claude Code уже установлен" }
else {
  Info "Устанавливаю Claude Code…"
  npm install -g '@anthropic-ai/claude-code'
  Update-SessionPath
  if (Have 'claude') { Ok "Claude Code установлен" } else { Warn "Claude Code установлен, но не на PATH — открой новый терминал" }
}

Write-Host "`n— Проверка —" -ForegroundColor Cyan
if (Have 'node')   { Ok "node  $(node -v)" }   else { Warn "node не найден" }
if (Have 'git')    { Ok "git   $((git --version) -replace 'git version ','')" } else { Warn "git не найден" }
if (Have 'claude') { Ok "claude установлен" }   else { Warn "claude не на PATH (открой новый терминал)" }

Write-Host "`nГотово! Следующие шаги:" -ForegroundColor Green
Write-Host "  1. Открой НОВЫЙ терминал (PowerShell)"
Write-Host "  2. Запусти:  claude"
Write-Host "  3. Залогинься по ссылке"
Write-Host "`nПодробный гайд: $GuideUrl"
