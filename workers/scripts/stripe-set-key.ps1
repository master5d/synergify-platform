#requires -Version 7
<#
.SYNOPSIS
  Set the Stripe secret key for the support checkout. Re-runnable (use to rotate / swap sandbox↔live).

  Does it all from your terminal, without the key ever touching the screen, shell history, or any chat:
    1. Reads the key from a hidden prompt; validates the prefix (sk_/rk_, test/live).
    2. Verifies it against Stripe directly — creates a throwaway Checkout Session (the exact scope our
       endpoint needs). Confirms the key works AND has Checkout-Session-write permission, and reports mode.
    3. Stores it as the Worker secret STRIPE_SECRET_KEY (wrangler, over stdin).
    4. Verifies the prod route flipped 503 → 200 (returns a Stripe checkout url).

.NOTES
  Use a sandbox key (sk_test_… / rk_test_…) first; later re-run with a live restricted key (rk_live_…
  scoped to "Checkout Sessions: Write"). Safe to re-run.
#>

[CmdletBinding()]
param(
  [string]$ProdRoute = 'https://ai.mamaev.coach/api/checkout/support'
)

$ErrorActionPreference = 'Stop'
$workersDir = Split-Path $PSScriptRoot -Parent   # workers/scripts -> workers
function Write-Step($n, $msg) { Write-Host "`n[$n] $msg" -ForegroundColor Cyan }

# --- read the key without echoing or logging it --------------------------------------------------
Write-Step 0 'Paste the Stripe SECRET key (input is hidden):'
$secure = Read-Host 'Stripe key' -AsSecureString
$plain  = ([System.Net.NetworkCredential]::new('', $secure).Password).Trim()
if ($plain -notmatch '^(sk|rk)_(test|live)_[A-Za-z0-9]+$') {
  throw 'That does not look like a Stripe secret key (expected sk_test_/sk_live_/rk_test_/rk_live_ …). Aborting — nothing changed.'
}
$mode = if ($plain -match '_live_') { 'LIVE' } else { 'TEST / sandbox' }
$kind = if ($plain.StartsWith('rk_')) { 'restricted' } else { 'standard secret' }

try {
  # --- 1. verify the key against Stripe (create a throwaway Checkout Session) ---------------------
  Write-Step 1 "Verifying the key with Stripe ($kind, $mode) ..."
  # Raw URLs in the value (Stripe's own curl examples do this) — ':' and '/' are safe with no '&'/'='.
  $body = @(
    'mode=payment',
    'line_items[0][quantity]=1',
    'line_items[0][price_data][currency]=usd',
    'line_items[0][price_data][product_data][name]=Verify',
    'line_items[0][price_data][unit_amount]=100',
    'success_url=https://ai.mamaev.coach/support/thanks/',
    'cancel_url=https://ai.mamaev.coach/support/'
  ) -join '&'
  try {
    $session = Invoke-RestMethod -Uri 'https://api.stripe.com/v1/checkout/sessions' -Method Post `
      -Headers @{ Authorization = "Bearer $plain" } -ContentType 'application/x-www-form-urlencoded' -Body $body
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    # PS7 puts the response body (Stripe's JSON error) here; surface error.message (never the key).
    $detail = ''
    try { $detail = ($_.ErrorDetails.Message | ConvertFrom-Json).error.message } catch { $detail = $_.ErrorDetails.Message }
    if ($code -eq 401) {
      throw "Stripe returned 401 — the key was not accepted. Re-copy the SECRET key. Nothing changed."
    }
    if ($code -eq 403) {
      throw "Stripe returned 403 — valid key but missing 'Checkout Sessions: Write'. Add that scope to the restricted key. Nothing changed."
    }
    throw "Stripe returned HTTP $code. Stripe says: $detail`nNothing changed."
  }
  if (-not $session.url) { throw 'Stripe did not return a session url — unexpected. Nothing changed.' }
  Write-Host "    OK — key works and can create Checkout Sessions ($mode)" -ForegroundColor Green

  # --- 2. store the Worker secret ----------------------------------------------------------------
  Write-Step 2 'Storing STRIPE_SECRET_KEY as a Worker secret (wrangler)...'
  Push-Location $workersDir
  try {
    $plain | npx --yes wrangler secret put STRIPE_SECRET_KEY
    if ($LASTEXITCODE -ne 0) { throw "wrangler secret put exited $LASTEXITCODE" }
  } finally { Pop-Location }
  Write-Host '    OK — secret set on tochka-sborki-api' -ForegroundColor Green
}
finally {
  $plain  = $null
  $secure = $null
  [System.GC]::Collect()
}

# --- 3. verify the prod route flipped 503 -> 200 (no secret needed here) --------------------------
Write-Step 3 'Verifying the prod route (a $7 request should now return a Stripe url, not 503)...'
$status = $null; $url = $null
for ($i = 1; $i -le 6; $i++) {
  try {
    $r = Invoke-RestMethod -Uri $ProdRoute -Method Post -ContentType 'application/json' -Body '{"amount":700,"locale":"ru"}'
    $status = 200; $url = $r.url
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
  }
  if ($status -ne 503) { break }
  Write-Host "    still 503 (secret propagating), retry $i/6 in 5s..." -ForegroundColor DarkGray
  Start-Sleep -Seconds 5
}

if ($status -eq 200 -and $url) {
  Write-Host "`n✅ LIVE — /api/checkout/support returns a Stripe checkout url ($mode). Open https://ai.mamaev.coach/support/ and try a preset." -ForegroundColor Green
  if ($mode -like 'TEST*') { Write-Host '   (Sandbox: pay with test card 4242 4242 4242 4242, any future date / any CVC.)' -ForegroundColor DarkGray }
} elseif ($status -eq 503) {
  Write-Host "`n⚠ Still 503 after retries — secret may need another moment, or the latest Worker isn't deployed. Re-run in a minute." -ForegroundColor Yellow
} else {
  Write-Host "`n❓ Route returned $status — unexpected. Check 'npx wrangler tail tochka-sborki-api'." -ForegroundColor Yellow
}
