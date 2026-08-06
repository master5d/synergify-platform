#requires -Version 7
<#
.SYNOPSIS
  Go-live for the Telegram Mini App (Phase 0). Re-runnable.

  Does three things from your real terminal, without the token ever touching the screen,
  the shell history, or any chat:
    1. Validates the BotFather token (getMe) and shows the bot username.
    2. Stores it as the Worker secret TELEGRAM_BOT_TOKEN (cloudflare wrangler).
    3. Sets the bot's menu button to launch the Mini App (Bot API setChatMenuButton),
       so users get an "Открыть курс" button — no BotFather menu step needed.
  Then verifies the prod route flipped from 503 (not configured) to live.

.NOTES
  Bot: Tochka Sborki  (@tochka_sborki_lms_bot)
  Run it, paste the token at the hidden prompt, done. Safe to re-run (idempotent).
#>

[CmdletBinding()]
param(
  [switch]$RegisterWebhook,
  [string]$WebhookUrl = 'https://ai.synergify.com/api/telegram/webhook',
  [string]$MiniAppUrl = 'https://ai.synergify.com/',
  [string]$ButtonText = 'Открыть курс',
  [string]$ProdRoute  = 'https://ai.synergify.com/api/auth/telegram'
)

$ErrorActionPreference = 'Stop'
$workersDir = Split-Path $PSScriptRoot -Parent   # workers/scripts -> workers

function Write-Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }

# --- read the token without echoing or logging it -------------------------------------------
Write-Step 0 'Paste the BotFather token (input is hidden):'
$secure = Read-Host 'Token' -AsSecureString
$plain  = ([System.Net.NetworkCredential]::new('', $secure).Password).Trim()
if ($plain -notmatch '^\d+:[A-Za-z0-9_-]{30,}$') {
  throw 'That does not look like a Telegram bot token (expected "<digits>:<35+ chars>"). Aborting — nothing changed.'
}

try {
  # --- 1. validate the token ---------------------------------------------------------------
  Write-Step 1 'Validating token with Telegram (getMe)...'
  $me = Invoke-RestMethod -Uri "https://api.telegram.org/bot$plain/getMe"
  if (-not $me.ok) { throw 'getMe failed — token rejected by Telegram.' }
  Write-Host "    OK — bot @$($me.result.username) (id $($me.result.id))" -ForegroundColor Green

  # --- 2. store the Worker secret ----------------------------------------------------------
  Write-Step 2 'Storing TELEGRAM_BOT_TOKEN as a Worker secret (wrangler)...'
  Push-Location $workersDir
  try {
    # piping over stdin avoids the interactive hidden prompt (no TTY needed) and never
    # places the token on the command line / in history.
    $plain | npx --yes wrangler secret put TELEGRAM_BOT_TOKEN
    if ($LASTEXITCODE -ne 0) { throw "wrangler secret put exited $LASTEXITCODE" }
  } finally { Pop-Location }
  Write-Host '    OK — secret set on tochka-sborki-api' -ForegroundColor Green

  # --- 3. set the Mini App menu button -----------------------------------------------------
  Write-Step 3 "Setting the bot menu button -> '$ButtonText' -> $MiniAppUrl ..."
  $body = @{
    menu_button = @{
      type    = 'web_app'
      text    = $ButtonText
      web_app = @{ url = $MiniAppUrl }
    }
  } | ConvertTo-Json -Depth 6
  $btn = Invoke-RestMethod -Uri "https://api.telegram.org/bot$plain/setChatMenuButton" `
    -Method Post -ContentType 'application/json; charset=utf-8' -Body $body
  if ($btn.ok) {
    Write-Host '    OK — menu button installed' -ForegroundColor Green
  } else {
    Write-Warning "    setChatMenuButton returned not-ok: $($btn | ConvertTo-Json -Compress)"
    Write-Warning '    Fallback: BotFather -> /setmenubutton -> URL above. (Secret is still set; auth works.)'
  }

  # --- 3b. register the webhook (only with -RegisterWebhook) --------------------------------
  if ($RegisterWebhook) {
    Write-Step '3b' 'Registering the Telegram webhook (secret_token) ...'
    # generate a random secret, store it as a Worker secret, then point Telegram at our route
    $whSecret = ([Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24))) `
      -replace '[^A-Za-z0-9]', ''
    Push-Location $workersDir
    try {
      $whSecret | npx --yes wrangler secret put TELEGRAM_WEBHOOK_SECRET
      if ($LASTEXITCODE -ne 0) { throw "wrangler secret put (webhook) exited $LASTEXITCODE" }
    } finally { Pop-Location }

    $whBody = @{
      url                  = $WebhookUrl
      secret_token         = $whSecret
      allowed_updates      = @('message', 'callback_query')
      drop_pending_updates = $true
    } | ConvertTo-Json -Depth 6
    $wh = Invoke-RestMethod -Uri "https://api.telegram.org/bot$plain/setWebhook" `
      -Method Post -ContentType 'application/json; charset=utf-8' -Body $whBody
    if ($wh.ok) {
      Write-Host '    OK — webhook registered' -ForegroundColor Green
    } else {
      Write-Warning "    setWebhook returned not-ok: $($wh | ConvertTo-Json -Compress)"
    }
    $whSecret = $null
  }
}
finally {
  # --- scrub the token from memory ---------------------------------------------------------
  $plain  = $null
  $secure = $null
  [System.GC]::Collect()
}

# --- verify prod flipped from 503 -> live (no secret needed here) -----------------------------
Write-Step 4 'Verifying the prod route (a dummy request should now 401, not 503)...'
$status = $null
for ($i = 1; $i -le 6; $i++) {
  try {
    Invoke-RestMethod -Uri $ProdRoute -Method Post -ContentType 'application/json' -Body '{"initData":"x"}' | Out-Null
    $status = 200
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
  }
  if ($status -ne 503) { break }
  Write-Host "    still 503 (secret propagating), retry $i/6 in 5s..." -ForegroundColor DarkGray
  Start-Sleep -Seconds 5
}

switch ($status) {
  401     { Write-Host "`n✅ LIVE — route returns 401 invalid_initData (token wired). Open @tochka_sborki_lms_bot and tap '$ButtonText'." -ForegroundColor Green }
  503     { Write-Host "`n⚠ Still 503 after retries — secret may need a moment, or the latest Worker isn't deployed. Re-run in a minute." -ForegroundColor Yellow }
  default { Write-Host "`n❓ Route returned $status — unexpected. Check 'npx wrangler tail' on tochka-sborki-api." -ForegroundColor Yellow }
}
