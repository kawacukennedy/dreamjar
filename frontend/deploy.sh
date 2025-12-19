#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting DreamJar Frontend Deployment"

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ] && [ -z "$NETLIFY_AUTH_TOKEN" ] && [ -z "$DOCKER_DEPLOY" ]; then
    echo "⚠️  Warning: Neither VERCEL_TOKEN, NETLIFY_AUTH_TOKEN, nor DOCKER_DEPLOY is set"
    echo "   Manual deployment will be used"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🔨 Building application..."
npm run build

# Check build size
echo "📊 Checking build size..."
du -sh dist/

# Deploy based on available tokens
if [ "$DOCKER_DEPLOY" = "true" ]; then
    echo "🐳 Deploying frontend with Docker..."

    # Check if docker and docker-compose are available
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Navigate to infrastructure directory
    cd ../infrastructure

    # Create secrets directory if it doesn't exist
    mkdir -p secrets

    # Copy environment variables to secrets files for Docker
    echo -n "${VITE_API_URL:-http://localhost:8080/api/v1}" > secrets/vite_api_url
    echo -n "${VITE_TON_NETWORK:-mainnet}" > secrets/vite_ton_network
    echo -n "${VITE_IPFS_GATEWAY:-https://gateway.pinata.cloud/ipfs/}" > secrets/vite_ipfs_gateway
    echo -n "${VITE_POSTHOG_KEY:-}" > secrets/vite_posthog_key
    echo -n "${VITE_SENTRY_DSN:-}" > secrets/vite_sentry_dsn
    echo -n "${VITE_TONCONNECT_MANIFEST:-https://your-frontend-domain.com/tonconnect-manifest.json}" > secrets/vite_tonconnect_manifest
    echo -n "${VITE_VERSION:-1.0.0}" > secrets/vite_version

    # Build and deploy with docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build frontend
        docker-compose -f docker-compose.prod.yml up -d frontend
        echo "✅ Successfully deployed frontend to production with Docker"
    else
        docker-compose build frontend
        docker-compose up -d frontend
        echo "✅ Successfully deployed frontend to development with Docker"
    fi

    cd ../frontend

elif [ -n "$VERCEL_TOKEN" ]; then
    echo "⬆️  Deploying to Vercel..."
    npx vercel --prod --yes
    echo "✅ Successfully deployed to Vercel"
elif [ -n "$NETLIFY_AUTH_TOKEN" ]; then
    echo "⬆️  Deploying to Netlify..."
    npx netlify-cli deploy --prod --dir=dist --yes
    echo "✅ Successfully deployed to Netlify"
else
    echo "📁 Build completed. Upload the 'dist/' folder to your hosting provider."
    echo ""
    echo "Supported platforms:"
    echo "  • Vercel: Set VERCEL_TOKEN and run this script"
    echo "  • Netlify: Set NETLIFY_AUTH_TOKEN and run this script"
    echo "  • Manual: Upload dist/ folder to any static hosting service"
fi

echo "🎉 Deployment process completed!"