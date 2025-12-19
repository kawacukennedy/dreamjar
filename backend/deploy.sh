#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting DreamJar Backend Deployment"

# Check if required environment variables are set
if [ -z "$RENDER_API_KEY" ] && [ -z "$RAILWAY_TOKEN" ] && [ -z "$DOCKER_DEPLOY" ]; then
    echo "⚠️  Warning: Neither RENDER_API_KEY, RAILWAY_TOKEN, nor DOCKER_DEPLOY is set"
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
if [ "$DOCKER_DEPLOY" = "true" ]; then
    echo "🐳 Deploying with Docker..."

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
    echo -n "${MONGO_URI:-mongodb://admin:password@mongodb:27017/dreamjar?authSource=admin}" > secrets/mongo_uri
    echo -n "${JWT_SECRET:-your_jwt_secret_here_change_this_in_production}" > secrets/jwt_secret
    echo -n "${FRONTEND_URL:-http://localhost:3000}" > secrets/frontend_url
    echo -n "${SENTRY_DSN:-}" > secrets/sentry_dsn
    echo -n "${SMTP_HOST:-}" > secrets/smtp_host
    echo -n "${SMTP_USER:-}" > secrets/smtp_user
    echo -n "${SMTP_PASS:-}" > secrets/smtp_pass
    echo -n "${IPFS_PROJECT_ID:-}" > secrets/ipfs_project_id
    echo -n "${IPFS_PROJECT_SECRET:-}" > secrets/ipfs_project_secret
    echo -n "${AWS_ACCESS_KEY_ID:-}" > secrets/aws_access_key_id
    echo -n "${AWS_SECRET_ACCESS_KEY:-}" > secrets/aws_secret_access_key
    echo -n "${AWS_REGION:-us-east-1}" > secrets/aws_region
    echo -n "${AWS_S3_BUCKET:-}" > secrets/aws_s3_bucket
    echo -n "${TON_NETWORK:-mainnet}" > secrets/ton_network
    echo -n "${BADGE_CONTRACT_ADDRESS:-}" > secrets/badge_contract_address
    echo -n "${DAO_CONTRACT_ADDRESS:-}" > secrets/dao_contract_address
    echo -n "${WISHJAR_FACTORY_ADDRESS:-}" > secrets/wishjar_factory_address

    # Build and deploy with docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.prod.yml build backend
        docker-compose -f docker-compose.prod.yml up -d backend
        echo "✅ Successfully deployed backend to production with Docker"
    else
        docker-compose build backend
        docker-compose up -d backend
        echo "✅ Successfully deployed backend to development with Docker"
    fi

    cd ../backend

elif [ -n "$RENDER_API_KEY" ]; then
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