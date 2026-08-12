$ErrorActionPreference = 'Stop'
$siteDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $siteDirectory
Write-Host '臺中好地 Fun 本機網站已啟動：' -ForegroundColor Green
Write-Host '公開網站：http://127.0.0.1:4173/'
Write-Host '內容管理：http://127.0.0.1:4173/admin/'
Write-Host '最新消息管理可使用「自動更新當期活動」功能。'
Write-Host '按 Ctrl+C 可停止網站。'
node .\tools\serve.mjs
