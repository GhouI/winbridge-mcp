#requires -Version 5.1
<#
.SYNOPSIS
    Relaunch WinBridge MCP headless (detached) so it keeps running after the
    terminal closes.
.DESCRIPTION
    Stops any existing WinBridge listener on the target port and its cloudflared
    tunnel, then starts `npm run dev` as a detached, hidden process whose output
    is redirected to winbridge.out.log in the project directory.

    WINBRIDGE_TOKEN must be set in the environment before running; this script
    does not embed any token.
.EXAMPLE
    $env:WINBRIDGE_TOKEN = "<your-token>"
    ./start-headless.ps1
#>
param(
    [int]$Port = $(if ($env:WINBRIDGE_PORT) { [int]$env:WINBRIDGE_PORT } else { 7573 }),
    [string]$ProjectDir = $PSScriptRoot
)

if (-not $env:WINBRIDGE_TOKEN) {
    Write-Warning "WINBRIDGE_TOKEN is not set. Set it before running, e.g. `$env:WINBRIDGE_TOKEN = '<token>'"
}

# 1. Stop the current WinBridge listener and its cloudflared tunnel
Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Relaunch detached + hidden, logging to a file in the project directory
$log = Join-Path $ProjectDir "winbridge.out.log"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm run dev > `"$log`" 2>&1" `
    -WorkingDirectory $ProjectDir `
    -WindowStyle Hidden

Write-Host "WinBridge relaunched headless on port $Port. Logs: $log"
