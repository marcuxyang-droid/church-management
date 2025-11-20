#!/bin/bash

# Church Management System - Deployment Script

echo "🚀 Deploying Church Management System..."

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN not set"
  exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

# Deploy to Cloudflare Pages
echo "🌐 Deploying frontend to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=church-management

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
