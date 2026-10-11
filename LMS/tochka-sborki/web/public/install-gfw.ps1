#Requires -Version 5
# Точка Сборки — установщик стека Behind-Firewall (цензурный файрвол / закрытый регион; Windows 11)
# Ставит: Python + LiteLLM proxy + агент Hermes (официальным установщиком Nous Research);
# пишет cloud-relay конфиг и подключает Hermes к шлюзу.
# Использование: irm https://ai.synergify.com/install-gfw.ps1 | iex
# Россия (Gemini закрыт — GigaChat): $env:GFW_REGION = 'ru'; irm https://ai.synergify.com/install-gfw.ps1 | iex

$ErrorActionPreference = 'Stop'
$GuideUrl = 'https://ai.synergify.com/lessons/03-stack-selection/u3-behind-gfw/'
$CfgDir = Join-Path $HOME '.config\litellm'
$Region = "$env:GFW_REGION".Trim().ToLower()
$HermesInstallUrl = 'https://hermes-agent.nousresearch.com/install.ps1'
$HermesHome = if ($env:HERMES_HOME) { $env:HERMES_HOME } else { Join-Path $env:LOCALAPPDATA 'hermes' }

function Info($m) { Write-Host "▸ $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "✓ $m" -ForegroundColor Green }
function Warn($m) { Write-Host "! $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "✗ $m" -ForegroundColor Red; exit 1 }
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Update-SessionPath {
  $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
              [System.Environment]::GetEnvironmentVariable('Path','User')
}
# .env без BOM: python-dotenv (Hermes) иначе прочитает имя первой переменной вместе с BOM
function Add-EnvLine($path, $line) {
  [System.IO.File]::AppendAllText($path, "$line`n", (New-Object System.Text.UTF8Encoding $false))
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

Info "Ставлю pipx + LiteLLM…"
python -m pip install --user --quiet pipx
python -m pipx ensurepath | Out-Null
Update-SessionPath
python -m pipx install 'litellm[proxy]'
Ok "LiteLLM готов"

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

$envFile = Join-Path $CfgDir '.env'
if (Test-Path $envFile) { Warn ".env уже есть — не затираю" }
elseif ($Region -eq 'ru') {
  Add-EnvLine $envFile '# Впиши свои ключи провайдеров'
  Add-EnvLine $envFile '# Ключ авторизации проекта GigaChat (Client ID:Client Secret в base64) — developers.sber.ru'
  Add-EnvLine $envFile 'GIGACHAT_CREDENTIALS=ключ-авторизации'
  Add-EnvLine $envFile '# CEREBRAS_API_KEY=csk-xxxxx   # если раскомментировал fast-pool'
} else {
  Add-EnvLine $envFile '# Впиши свои ключи провайдеров'
  Add-EnvLine $envFile 'CEREBRAS_API_KEY=csk-xxxxx'
  Add-EnvLine $envFile 'GOOGLE_API_KEY=AIza-xxxxx'
}
# Свежий LiteLLM не стартует без master key; тот же ключ агент передаёт шлюзу как API key
$masterLine = Get-Content $envFile | Where-Object { $_ -match '^LITELLM_MASTER_KEY=' } | Select-Object -Last 1
if (-not $masterLine) {
  $bytes = New-Object byte[] 24
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $masterLine = 'LITELLM_MASTER_KEY=sk-' + (($bytes | ForEach-Object { $_.ToString('x2') }) -join '')
  Add-EnvLine $envFile $masterLine
  Ok "ключ шлюза LITELLM_MASTER_KEY записан в .env"
}

@'
$ErrorActionPreference = "Stop"
$CfgDir = Join-Path $HOME ".config\litellm"
$envFile = Join-Path $CfgDir ".env"
if (-not (Test-Path $envFile)) { Write-Host "Нет $envFile — запусти установщик ещё раз"; exit 1 }
Get-Content $envFile | ForEach-Object { if ($_ -match "^\s*([^#=]+)=(.*)$") { [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim()) } }
# Свежий LiteLLM не стартует без master key: создаём его один раз и храним в .env
if (-not $env:LITELLM_MASTER_KEY) {
  $bytes = New-Object byte[] 24
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $env:LITELLM_MASTER_KEY = "sk-" + (($bytes | ForEach-Object { $_.ToString("x2") }) -join "")
  [System.IO.File]::AppendAllText($envFile, "LITELLM_MASTER_KEY=$($env:LITELLM_MASTER_KEY)`n", (New-Object System.Text.UTF8Encoding $false))
  Write-Host "Создал LITELLM_MASTER_KEY в $envFile — его агент передаёт шлюзу как API key"
}
litellm --config (Join-Path $CfgDir "config.yaml") --port 4000 --host 127.0.0.1
'@ | Set-Content -Encoding UTF8 (Join-Path $CfgDir 'start.ps1')
Ok "launcher start.ps1 + .env готовы"

# Hermes распространяется только своим установщиком (pip-сборку он запрещает).
$model = 'fast-pool'; $keys = 'Cerebras + Gemini'
if ($Region -eq 'ru') { $model = 'balanced'; $keys = 'GigaChat' }
$hermesPreexisting = Have 'hermes'
if ($hermesPreexisting) {
  Ok "Hermes уже установлен — его настройки не трогаю"
  Warn "Свой Hermes подключи к шлюзу сам: гайд u3, шаг 5 (адрес http://127.0.0.1:4000/v1, модель $model)"
} else {
  Info "Ставлю Hermes официальным установщиком Nous Research…"
  try {
    $inst = Join-Path $env:TEMP "hermes-install-$([guid]::NewGuid().ToString('N')).ps1"
    Invoke-WebRequest -Uri $HermesInstallUrl -OutFile $inst -UseBasicParsing
    & $inst -NonInteractive -SkipBrowser -SkipComputerUse
    if ($LASTEXITCODE -ne 0) { Warn "Установщик Hermes вышел с кодом $LASTEXITCODE" }
    Remove-Item $inst -Force -ErrorAction SilentlyContinue
  } catch { Warn "Установщик Hermes завершился с ошибкой: $($_.Exception.Message)" }
  Update-SessionPath
  if (Have 'hermes') {
    try {
      hermes config set model.provider custom | Out-Null; if ($LASTEXITCODE -ne 0) { throw 'config set' }
      hermes config set model.base_url http://127.0.0.1:4000/v1 | Out-Null; if ($LASTEXITCODE -ne 0) { throw 'config set' }
      hermes config set model.default $model | Out-Null; if ($LASTEXITCODE -ne 0) { throw 'config set' }
      hermes config set model.key_env LITELLM_MASTER_KEY | Out-Null; if ($LASTEXITCODE -ne 0) { throw 'config set' }
      New-Item -ItemType Directory -Force $HermesHome | Out-Null
      $hermesEnv = Join-Path $HermesHome '.env'
      if (-not ((Test-Path $hermesEnv) -and (Select-String -Path $hermesEnv -Pattern '^LITELLM_MASTER_KEY=' -Quiet))) {
        Add-EnvLine $hermesEnv $masterLine
      }
      Ok "Hermes подключён к шлюзу (модель $model)"
    } catch { Warn "Не удалось настроить Hermes — сделай это по гайду u3, шаг 5" }
  } else {
    Warn "Hermes не установился. Шлюз работает и без него; поставь Hermes вручную: iex (irm $HermesInstallUrl)"
  }
}

Write-Host "`n— Проверка —" -ForegroundColor Cyan
if (Have 'python') { Ok "python $(python --version)" } else { Warn "python не найден" }
if (Have 'litellm') { Ok "litellm установлен" } else { Warn "litellm не на PATH (открой новый терминал)" }
if (Have 'hermes') { Ok "hermes установлен" } else { Warn "hermes не найден" }

Write-Host "`nГотово! Следующие шаги:" -ForegroundColor Green
Write-Host "  1. Впиши ключ $keys в $CfgDir\.env"
Write-Host "  2. Запусти шлюз:    & $CfgDir\start.ps1"
Write-Host "  3. В другом окне PowerShell: hermes   (уже подключён к шлюзу, модель $model)"
Write-Host "  Другой OpenAI-совместимый агент: адрес http://127.0.0.1:4000/v1, ключ — LITELLM_MASTER_KEY из .env, модель $model"
Write-Host "`nПодробный гайд: $GuideUrl"
