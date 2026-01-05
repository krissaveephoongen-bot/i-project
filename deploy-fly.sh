#!/bin/bash

# Fly.io Deployment Script for macOS/Linux
# Usage: bash deploy-fly.sh

echo "=== Fly.io Backend Deployment ==="

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "✗ flyctl not found."
    echo "Install from: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

echo "✓ flyctl is installed: $(flyctl version)"

# Check if authenticated
if ! flyctl auth whoami &> /dev/null; then
    echo "✗ Not authenticated."
    echo "Run: flyctl auth login"
    exit 1
fi

USER=$(flyctl auth whoami)
echo "✓ Authenticated as: $USER"

# Confirm deployment
echo ""
read -p "Ready to deploy backend to Fly.io? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy
echo ""
echo "Deploying to Fly.io..."
flyctl deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Deployment successful!"
    
    # Extract app name from fly.toml
    APP_NAME=$(grep "^app = " fly.toml | sed 's/app = "//; s/".*//')
    APP_URL="https://$APP_NAME.fly.dev"
    
    echo ""
    echo "Your API URL: $APP_URL/api"
    echo "Health check: curl $APP_URL/api/health"
    echo ""
    echo "Next step: Update VITE_API_URL on Vercel dashboard"
    echo "Run: flyctl secrets list"
else
    echo ""
    echo "✗ Deployment failed!"
    echo "Check logs: flyctl logs"
    exit 1
fi
