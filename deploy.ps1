# Church Management System - Deployment Script (PowerShell)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$stampFile = Join-Path $scriptRoot ".deploystamp"
$expectedStamp = "CHURCH_MANAGEMENT_V1"

if (-not (Test-Path $stampFile)) {
    Write-Host "❌ Missing deployment stamp (.deploystamp). Please use the V1 project root." -ForegroundColor Red
    exit 1
}

$stampContent = (Get-Content $stampFile -Raw).Trim()
if ($stampContent -ne $expectedStamp) {
    Write-Host "❌ Deployment stamp mismatch. Expected $expectedStamp but found '$stampContent'." -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Deploying Church Management System..." -ForegroundColor Cyan

# Check if required environment variables are set
if (-not $env:CLOUDFLARE_API_TOKEN) {
    Write-Host "❌ Error: CLOUDFLARE_API_TOKEN not set" -ForegroundColor Red
    Write-Host "Please set it with: `$env:CLOUDFLARE_API_TOKEN='your_token'" -ForegroundColor Yellow
    exit 1
}

# Set default Worker URL
$WORKER_NAME = "church-management"
$WORKER_URL = "https://${WORKER_NAME}.marcuxyang-droid.workers.dev"

# Ensure API endpoint is available for frontend build
if (-not $env:VITE_API_URL) {
    $env:VITE_API_URL = $WORKER_URL
    Write-Host "⚠️  VITE_API_URL not provided. Defaulting to $WORKER_URL" -ForegroundColor Yellow
} else {
    Write-Host "✅ Using VITE_API_URL=$env:VITE_API_URL" -ForegroundColor Green
}

# Build frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Deploy Workers first (to get the correct URL)
Write-Host "`n🔧 Deploying backend to Cloudflare Workers..." -ForegroundColor Cyan
Set-Location workers

# Set wrangler config
$env:CLOUDFLARE_ACCOUNT_ID = "d9be70f4ad07e87f515c30366ec0ad88"

npm run deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend deployment failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Deploy to Cloudflare Pages (production branch)
Write-Host "`n🌐 Deploying frontend to Cloudflare Pages (production)..." -ForegroundColor Cyan
npx wrangler pages deploy dist --project-name=church-management --branch=production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: https://church-management.pages.dev" -ForegroundColor Cyan
Write-Host "🔧 Backend: $WORKER_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: If the Worker URL is different, update VITE_API_URL and rebuild." -ForegroundColor Yellow







