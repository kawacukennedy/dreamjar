#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting DreamJar Frontend Deployment"

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ] && [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "⚠️  Warning: Neither VERCEL_TOKEN nor NETLIFY_AUTH_TOKEN is set"
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
if [ -n "$VERCEL_TOKEN" ]; then
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