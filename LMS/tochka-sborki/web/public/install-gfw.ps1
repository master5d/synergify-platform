#Requires -Version 5
# Точка Сборки — установщик стека Behind-Firewall (цензурный файрвол / закрытый регион; Windows 11)
# Ставит: Python + LiteLLM proxy + Aider; пишет cloud-relay конфиг.
# Использование: irm https://ai.synergify.com/install-gfw.ps1 | iex
# Россия (Gemini закрыт — GigaChat): $env:GFW_REGION = 'ru'; irm https://ai.synergify.com/install-gfw.ps1 | iex

$ErrorActionPreference = 'Stop'
$GuideUrl = 'https://ai.synergify.com/lessons/03-stack-selection/u3-behind-gfw/'
$CfgDir = Join-Path $HOME '.config\litellm'
$Region = "$env:GFW_REGION".Trim().ToLower()

function Info($m) { Write-Host "▸ $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "✓ $m" -ForegroundColor Green }
function Warn($m) { Write-Host "! $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "✗ $m" -ForegroundColor Red; exit 1 }
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Update-SessionPath {
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [System.Environment]::GetEnvironmentVariable('Path','User')
}

Write-Host "Точка Сборки — установка стека Behind-Firewall`n" -ForegroundColor Cyan
if ($Region -and $Region -ne 'ru') { Fail "GFW_REGION=$Region не поддерживается (есть только ru)" }
if ($Region -eq 'ru') { Info "Режим: Россия (GigaChat вместо Gemini)" }

if (-not (Have 'winget')) { Fail "winget не найден. Обнови «App Installer» из Microsoft Store. Гайд: $GuideUrl" }

if (-not (Have 'python')) {
  Info "Устанавливаю Python…"
  winget install --silent --accept-package-agreements --accept-source-agreements --id Python.Python.3.12
  Update-SessionPath
}
if (-not (Have 'python')) { Fail "Не удалось установить Python. Гайд: $GuideUrl" }
Ok "Python готов ($(python --version))"

Info "Ставлю pipx + LiteLLM + Aider…"
python -m pip install --user --quiet pipx
python -m pipx ensurepath | Out-Null
Update-SessionPath
python -m pipx install 'litellm[proxy]'
python -m pipx install aider-chat
Ok "LiteLLM + Aider готовы"

New-Item -ItemType Directory -Force $CfgDir | Out-Null
$cfg = Join-Path $CfgDir 'config.yaml'
if (Test-Path $cfg) { Copy-Item $cfg "$cfg.bak" -Force; Warn "config.yaml уже есть — бэкап в config.yaml.bak" }
elseif ($Region -eq 'ru') {
@'
model_list:
  - model_name: balanced
    litellm_params:
      model: gigachat/GigaChat-2-Lite   # сверь имена моделей в кабинете GigaChat
      api_key: os.environ/GIGACHAT_CREDENTIALS
      ssl_verify: false                 # сертификат GigaChat — российский УЦ; только в этом блоке
  # fast-pool (Cerebras) — если Cerebras пускает из твоей сети: раскомментируй и впиши CEREBRAS_API_KEY в .env
  # - model_name: fast-pool
  #   litellm_params:
  #     model: cerebras/qwen-3-235b-a22b
  #     api_key: os.environ/CEREBRAS_API_KEY
  # local-floor (llama-server :8080) — опционально, см. гайд u3 «Шаг 4»
'@ | Set-Content -Encoding UTF8 $cfg
  Ok "config.yaml записан (Россия: GigaChat)"
}
else {
@'
model_list:
  - model_name: fast-pool
    litellm_params:
      model: cerebras/qwen-3-235b-a22b
      api_key: os.environ/CEREBRAS_API_KEY
  - model_name: balanced
    litellm_params:
      model: gemini/gemini-2.5-flash
      api_key: os.environ/GOOGLE_API_KEY
  # local-floor (llama-server :8080) — опционально, см. гайд u3 «Шаг 4»
router_settings:
  routing_strategy: simple-shuffle
  fallbacks:
    - fast-pool: ["balanced"]
'@ | Set-Content -Encoding UTF8 $cfg
  Ok "config.yaml записан"
}
if ($Region -eq 'ru') {
@'
# Скопируй этот файл в .env и впиши свои ключи
# Ключ авторизации проекта GigaChat (Client ID:Client Secret в base64) — developers.sber.ru
GIGACHAT_CREDENTIALS=ключ-авторизации
# CEREBRAS_API_KEY=csk-xxxxx   # если раскомментировал fast-pool
'@ | Set-Content -Encoding UTF8 (Join-Path $CfgDir '.env.example')
} else {
@'
# Скопируй этот файл в .env и впиши свои ключи
CEREBRAS_API_KEY=csk-xxxxx
GOOGLE_API_KEY=AIza-xxxxx
'@ | Set-Content -Encoding UTF8 (Join-Path $CfgDir '.env.example')
}
@'
$ErrorActionPreference = "Stop"
$CfgDir = Join-Path $HOME ".config\litellm"
$envFile = Join-Path $CfgDir ".env"
if (-not (Test-Path $envFile)) { Write-Host "Нет $envFile — скопируй .env.example в .env и впиши ключи"; exit 1 }
Get-Content $envFile | ForEach-Object { if ($_ -match "^\s*([^#=]+)=(.*)$") { [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim()) } }
# Свежий LiteLLM не стартует без master key: создаём его один раз и храним в .env
if (-not $env:LITELLM_MASTER_KEY) {
  $bytes = New-Object byte[] 24
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $env:LITELLM_MASTER_KEY = "sk-" + (($bytes | ForEach-Object { $_.ToString("x2") }) -join "")
  Add-Content -Path $envFile -Value ("LITELLM_MASTER_KEY=" + $env:LITELLM_MASTER_KEY) -Encoding UTF8
  Write-Host "Создал LITELLM_MASTER_KEY в $envFile — его агент передаёт шлюзу как API key"
}
litellm --config (Join-Path $CfgDir "config.yaml") --port 4000 --host 127.0.0.1
'@ | Set-Content -Encoding UTF8 (Join-Path $CfgDir 'start.ps1')
Ok "launcher start.ps1 + .env.example готовы"

Write-Host "`n— Проверка —" -ForegroundColor Cyan
if (Have 'python') { Ok "python $(python --version)" } else { Warn "python не найден" }
if (Have 'litellm') { Ok "litellm установлен" } else { Warn "litellm не на PATH (открой новый терминал)" }
if (Have 'aider') { Ok "aider установлен" } else { Warn "aider не на PATH (открой новый терминал)" }

Write-Host "`nГотово! Следующие шаги:" -ForegroundColor Green
$model = 'fast-pool'; $keys = 'Cerebras + Gemini'
if ($Region -eq 'ru') { $model = 'balanced'; $keys = 'GigaChat' }
Write-Host "  1. Скопируй $CfgDir\.env.example в .env и впиши ключ $keys"
Write-Host "  2. Запусти прокси:  & $CfgDir\start.ps1"
Write-Host "  3. Наведи Aider:    aider --model openai/$model --openai-api-base http://localhost:4000 --openai-api-key <LITELLM_MASTER_KEY из .env>"
Write-Host "     (ключ LITELLM_MASTER_KEY start.ps1 создаст в .env при первом запуске)"
Write-Host "  GUI-вариант: расширение Cline в VS Code → тот же http://localhost:4000"
Write-Host "`nПодробный гайд: $GuideUrl"
