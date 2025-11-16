#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Complete DreamJar Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the root directory of the DreamJar project"
    exit 1
fi

# Parse command line arguments
DEPLOY_FRONTEND=true
DEPLOY_BACKEND=true
DEPLOY_CONTRACTS=true
ENVIRONMENT="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-frontend)
            DEPLOY_FRONTEND=false
            shift
            ;;
        --no-backend)
            DEPLOY_BACKEND=false
            shift
            ;;
        --no-contracts)
            DEPLOY_CONTRACTS=false
            shift
            ;;
        --staging)
            ENVIRONMENT="staging"
            shift
            ;;
        --testnet)
            ENVIRONMENT="testnet"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-frontend    Skip frontend deployment"
            echo "  --no-backend     Skip backend deployment"
            echo "  --no-contracts   Skip contract deployment"
            echo "  --staging        Deploy to staging environment"
            echo "  --testnet        Deploy contracts to testnet"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Environment: $ENVIRONMENT"
print_status "Deploy Frontend: $DEPLOY_FRONTEND"
print_status "Deploy Backend: $DEPLOY_BACKEND"
print_status "Deploy Contracts: $DEPLOY_CONTRACTS"

# Set environment variables based on deployment target
if [ "$ENVIRONMENT" = "staging" ]; then
    export VERCEL_ORG_ID=${VERCEL_STAGING_ORG_ID:-$VERCEL_ORG_ID}
    export VERCEL_PROJECT_ID=${VERCEL_STAGING_PROJECT_ID:-$VERCEL_PROJECT_ID}
    export RENDER_SERVICE_ID=${RENDER_STAGING_SERVICE_ID:-$RENDER_SERVICE_ID}
fi

if [ "$ENVIRONMENT" = "testnet" ]; then
    export TON_NETWORK="testnet"
else
    export TON_NETWORK="mainnet"
fi

# Deploy smart contracts first (if requested)
if [ "$DEPLOY_CONTRACTS" = true ]; then
    print_status "Deploying smart contracts..."
    cd contracts
    chmod +x deploy.sh
    ./deploy.sh

    # Get contract addresses for backend
    if [ -f "build/deployment.json" ]; then
        FACTORY_ADDRESS=$(jq -r '.factoryAddress' build/deployment.json)
        export WISHJAR_FACTORY_ADDRESS=$FACTORY_ADDRESS
        print_success "Contracts deployed. Factory address: $FACTORY_ADDRESS"
    fi
    cd ..
fi

# Deploy backend (if requested)
if [ "$DEPLOY_BACKEND" = true ]; then
    print_status "Deploying backend..."
    cd backend
    chmod +x deploy.sh
    ./deploy.sh
    cd ..
fi

# Deploy frontend (if requested)
if [ "$DEPLOY_FRONTEND" = true ]; then
    print_status "Deploying frontend..."
    cd frontend
    chmod +x deploy.sh
    ./deploy.sh
    cd ..
fi

print_success "🎉 All deployments completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your DNS records to point to the deployed frontend"
echo "2. Configure monitoring and alerts"
echo "3. Test the application end-to-end"
echo "4. Announce the launch to your community!"
echo ""
echo "For rollback instructions, check the deployment logs above."