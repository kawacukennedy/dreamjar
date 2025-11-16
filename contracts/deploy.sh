#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting DreamJar Smart Contract Deployment"

# Check if TON CLI is installed
if ! command -v toncli &> /dev/null; then
    echo "❌ TON CLI is not installed. Please install it first:"
    echo "   pip install toncli"
    exit 1
fi

# Check if wallet is configured
if [ -z "$TON_WALLET_MNEMONIC" ]; then
    echo "⚠️  Warning: TON_WALLET_MNEMONIC not set"
    echo "   Contracts will be compiled but not deployed"
fi

# Set network (testnet by default)
NETWORK=${TON_NETWORK:-"testnet"}
echo "🌐 Deploying to: $NETWORK"

# Create build directory
mkdir -p build

# Compile WishJar contract
echo "🔨 Compiling WishJar contract..."
toncli compile contracts/WishJar.fc -o build/

# Compile BadgeJettonNFT contract
echo "🔨 Compiling BadgeJettonNFT contract..."
toncli compile contracts/BadgeJettonNFT.fc -o build/

# Compile ImpactDAO contract
echo "🔨 Compiling ImpactDAO contract..."
toncli compile contracts/ImpactDAO.fc -o build/

# Compile WishJarFactory contract
echo "🔨 Compiling WishJarFactory contract..."
toncli compile contracts/WishJarFactory.fc -o build/

echo "✅ All contracts compiled successfully"

# Deploy contracts if wallet is configured
if [ -n "$TON_WALLET_MNEMONIC" ]; then
    echo "⬆️  Deploying contracts..."

    # Deploy WishJarFactory first (it creates other contracts)
    echo "🏭 Deploying WishJarFactory..."
    toncli deploy build/WishJarFactory.fif --network $NETWORK --wallet-mnemonic "$TON_WALLET_MNEMONIC"

    # Get factory address from deployment output
    FACTORY_ADDRESS=$(toncli deploy build/WishJarFactory.fif --network $NETWORK --wallet-mnemonic "$TON_WALLET_MNEMONIC" --dry-run | grep "Contract address:" | awk '{print $3}')

    echo "📝 Factory deployed at: $FACTORY_ADDRESS"

    # Save deployment info
    echo "{
  \"network\": \"$NETWORK\",
  \"factoryAddress\": \"$FACTORY_ADDRESS\",
  \"deployedAt\": \"$(date -Iseconds)\",
  \"contracts\": {
    \"WishJar\": \"build/WishJar.fif\",
    \"BadgeJettonNFT\": \"build/BadgeJettonNFT.fif\",
    \"ImpactDAO\": \"build/ImpactDAO.fif\",
    \"WishJarFactory\": \"build/WishJarFactory.fif\"
  }
}" > build/deployment.json

    echo "✅ Contracts deployed successfully"
    echo "📄 Deployment info saved to build/deployment.json"

else
    echo "📁 Contracts compiled but not deployed."
    echo "   To deploy:"
    echo "   1. Set TON_WALLET_MNEMONIC environment variable"
    echo "   2. Run: TON_NETWORK=mainnet ./deploy.sh"
    echo ""
    echo "   Or deploy manually:"
    echo "   toncli deploy build/WishJarFactory.fif --network testnet"
fi

echo "🎉 Contract deployment process completed!"