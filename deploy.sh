#!/bin/bash

# Church Management System - Deployment Script

# Always run from the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
PROJECT_FOLDER="$(basename "$SCRIPT_DIR")"
if [[ ! "$PROJECT_FOLDER" =~ ^V([0-9]+(\.[0-9]+)?)$ ]]; then
  echo "❌ Invalid project folder name '$PROJECT_FOLDER'. Expected names like V1, V1.1, V2..."
  exit 1
fi
MAJOR_VERSION="${BASH_REMATCH[1]%%.*}"
if (( MAJOR_VERSION < 1 )); then
  echo "❌ Deployment blocked: only V1 (major version ≥1) or newer folders may deploy. Current folder: $PROJECT_FOLDER"
  exit 1
fi

STAMP_FILE="$SCRIPT_DIR/.deploystamp"
EXPECTED_STAMP="CHURCH_MANAGEMENT_V1"

if [ ! -f "$STAMP_FILE" ]; then
  echo "❌ Missing deployment stamp (.deploystamp). Please use the V1 project root."
  exit 1
fi

STAMP_CONTENT="$(tr -d '\r\n\t ' < "$STAMP_FILE")"
if [ "$STAMP_CONTENT" != "$EXPECTED_STAMP" ]; then
  echo "❌ Deployment stamp mismatch. Expected $EXPECTED_STAMP but found '$STAMP_CONTENT'."
  exit 1
fi

echo "🚀 Deploying Church Management System..."

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN not set"
  exit 1
fi

# Ensure API endpoint is available for frontend build
if [ -z "$VITE_API_URL" ]; then
  export VITE_API_URL="https://church-management.marcuxyang.workers.dev"
  echo "ℹ️  VITE_API_URL not provided. Defaulting to $VITE_API_URL"
else
  echo "ℹ️  Using VITE_API_URL=$VITE_API_URL"
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

# Deploy to Cloudflare Pages (production branch)
echo "🌐 Deploying frontend to Cloudflare Pages (production)..."
npx wrangler pages deploy dist --project-name=church-management --branch=production

if [ $? -ne 0 ]; then
  echo "❌ Frontend deployment failed"
  exit 1
fi

# Deploy Workers
echo "⚙️  Deploying backend to Cloudflare Workers..."
cd workers
npm run deploy

if [ $? -ne 0 ]; then
  echo "❌ Backend deployment failed"
  exit 1
fi

cd ..

echo "✅ Deployment complete!"
echo "📊 Frontend: https://church-management.pages.dev"
echo "⚙️  Backend: https://church-management.your-subdomain.workers.dev"
