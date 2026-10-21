# KrishiMix Production Runner Script
Write-Host "========================================" -ForegroundColor Green
Write-Host " Starting KrishiMix Full-Stack Service" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='$scriptDir\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000" -PassThru

# Wait 2 seconds for backend initialization
Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/2] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
$nodePath = "C:\Users\Siddaling Garoor\AppData\Local\Programs\nodejs;" + $env:PATH
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$nodePath'; cd '$scriptDir\frontend'; npm run dev" -PassThru

# Wait 2 seconds and open browser
Start-Sleep -Seconds 2
Write-Host "Opening KrishiMix in default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host "KrishiMix is active!" -ForegroundColor Green
