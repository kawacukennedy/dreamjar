#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting DreamJar Backend Deployment"

# Check if required environment variables are set
if [ -z "$RENDER_API_KEY" ] && [ -z "$RAILWAY_TOKEN" ]; then
    echo "⚠️  Warning: Neither RENDER_API_KEY nor RAILWAY_TOKEN is set"
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure to create one with production values."
    echo "   Required variables: MONGO_URI, JWT_SECRET, SENTRY_DSN, etc."
fi

# Deploy based on available tokens
if [ -n "$RENDER_API_KEY" ]; then
    echo "⬆️  Deploying to Render..."
    # Create a temporary deployment archive
    tar -czf deploy.tar.gz --exclude=node_modules --exclude=.git .

    # Use Render API to deploy
    curl -X POST \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"serviceId\": \"$RENDER_SERVICE_ID\", \"clearCache\": \"clear\"}" \
      https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys

    rm deploy.tar.gz
    echo "✅ Successfully triggered Render deployment"

elif [ -n "$RAILWAY_TOKEN" ]; then
    echo "⬆️  Deploying to Railway..."
    npx @railway/cli link --project $RAILWAY_PROJECT_ID
    npx @railway/cli up
    echo "✅ Successfully deployed to Railway"

else
    echo "📁 Build completed. Deploy using one of these methods:"
    echo ""
    echo "Supported platforms:"
    echo "  • Render: Set RENDER_API_KEY and RENDER_SERVICE_ID, then run this script"
    echo "  • Railway: Set RAILWAY_TOKEN and RAILWAY_PROJECT_ID, then run this script"
    echo "  • Heroku: heroku create && git push heroku main"
    echo "  • DigitalOcean App Platform: Connect your repo and deploy"
    echo "  • Manual: Upload dist/ folder and configure your server"
    echo ""
    echo "Make sure these environment variables are set in production:"
    echo "  • MONGO_URI - MongoDB connection string"
    echo "  • JWT_SECRET - Secret key for JWT tokens"
    echo "  • SENTRY_DSN - Sentry error tracking"
    echo "  • SMTP_HOST, SMTP_USER, SMTP_PASS - Email configuration"
    echo "  • FRONTEND_URL - Frontend application URL"
    echo "  • IPFS_PROJECT_ID, IPFS_PROJECT_SECRET - IPFS storage"
fi

echo "🎉 Backend deployment process completed!"