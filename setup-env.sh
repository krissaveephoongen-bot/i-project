#!/bin/bash

# Environment Setup Script
# Automates creation of .env files for frontend and backend

echo "=========================================="
echo "  Environment Variables Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get current directory
CURRENT_DIR=$(pwd)
FRONTEND_DIR="$CURRENT_DIR"
BACKEND_DIR="$CURRENT_DIR/../ticket-apw-backend"

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32
}

# Function to create frontend .env.local
setup_frontend() {
    echo -e "${YELLOW}Setting up Frontend (.env.local)${NC}"
    echo ""
    
    if [ -f "$FRONTEND_DIR/.env.local" ]; then
        echo -e "${RED}✗ .env.local already exists${NC}"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipped frontend setup"
            return
        fi
    fi
    
    read -p "Enter Backend API URL (default: http://localhost:5000): " API_URL
    API_URL=${API_URL:-http://localhost:5000}
    
    read -p "Enable Analytics? (y/n, default: n): " ANALYTICS
    ANALYTICS=${ANALYTICS:-n}
    if [[ $ANALYTICS =~ ^[Yy]$ ]]; then
        ANALYTICS_ENABLED="true"
    else
        ANALYTICS_ENABLED="false"
    fi
    
    read -p "Enable Debug? (y/n, default: y for dev): " DEBUG
    DEBUG=${DEBUG:-y}
    if [[ $DEBUG =~ ^[Yy]$ ]]; then
        DEBUG_ENABLED="true"
    else
        DEBUG_ENABLED="false"
    fi
    
    cat > "$FRONTEND_DIR/.env.local" << EOF
# Frontend Environment Variables
VITE_API_URL=$API_URL
VITE_ENABLE_ANALYTICS=$ANALYTICS_ENABLED
VITE_ENABLE_DEBUG=$DEBUG_ENABLED
NODE_ENV=development
EOF
    
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo "  API URL: $API_URL"
    echo "  Analytics: $ANALYTICS_ENABLED"
    echo "  Debug: $DEBUG_ENABLED"
    echo ""
}

# Function to create backend .env
setup_backend() {
    echo -e "${YELLOW}Setting up Backend (.env)${NC}"
    echo ""
    
    if [ -f "$FRONTEND_DIR/.env" ]; then
        echo -e "${RED}✗ .env already exists${NC}"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipped backend setup"
            return
        fi
    fi
    
    echo "Database Configuration:"
    read -p "  Database Host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "  Database Port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "  Database Name (default: ticket_apw): " DB_NAME
    DB_NAME=${DB_NAME:-ticket_apw}
    
    read -p "  Database User (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "  Database Password: " DB_PASSWORD
    echo
    
    # Build DATABASE_URL
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    echo ""
    echo "JWT & Session Secrets (generating random keys):"
    JWT_SECRET=$(generate_secret)
    SESSION_SECRET=$(generate_secret)
    echo "  ✓ JWT_SECRET generated"
    echo "  ✓ SESSION_SECRET generated"
    
    echo ""
    read -p "Frontend URL for CORS (default: http://localhost:5173): " CORS_ORIGIN
    CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:5173}
    
    echo ""
    read -p "Admin Email (default: admin@example.com): " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
    
    read -sp "Admin Password: " ADMIN_PASSWORD
    echo
    
    read -p "Admin Name (default: System Administrator): " ADMIN_NAME
    ADMIN_NAME=${ADMIN_NAME:-System Administrator}
    
    cat > "$FRONTEND_DIR/.env" << EOF
# Backend Environment Variables

# Environment
NODE_ENV=development
PORT=5000

# Database (REQUIRED)
DATABASE_URL=$DATABASE_URL
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT & Security (REQUIRED)
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
SESSION_SECRET=$SESSION_SECRET
BCRYPT_ROUNDS=10

# CORS (REQUIRED)
CORS_ORIGIN=$CORS_ORIGIN

# Admin User Setup (REQUIRED)
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_NAME=$ADMIN_NAME

# Optional Services
REDIS_URL=redis://localhost:6379
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_API_DOCS=true
ENABLE_RATE_LIMITING=true

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
EOF
    
    echo -e "${GREEN}✓ Created .env${NC}"
    echo "  Database: $DB_NAME @ $DB_HOST:$DB_PORT"
    echo "  CORS Origin: $CORS_ORIGIN"
    echo "  Admin Email: $ADMIN_EMAIL"
    echo ""
}

# Main menu
show_menu() {
    echo "Select setup option:"
    echo "1) Setup Frontend (.env.local)"
    echo "2) Setup Backend (.env)"
    echo "3) Setup Both"
    echo "4) View Frontend Settings"
    echo "5) View Backend Settings"
    echo "6) Exit"
    echo ""
    read -p "Enter choice (1-6): " choice
}

# View frontend settings
view_frontend() {
    if [ -f "$FRONTEND_DIR/.env.local" ]; then
        echo ""
        echo -e "${YELLOW}Frontend (.env.local):${NC}"
        cat "$FRONTEND_DIR/.env.local"
        echo ""
    else
        echo -e "${RED}Frontend .env.local not found${NC}"
        echo ""
    fi
}

# View backend settings
view_backend() {
    if [ -f "$FRONTEND_DIR/.env" ]; then
        echo ""
        echo -e "${YELLOW}Backend (.env):${NC}"
        # Hide sensitive values
        grep -v "PASSWORD\|SECRET" "$FRONTEND_DIR/.env"
        echo "PASSWORD: [hidden]"
        echo "JWT_SECRET: [hidden]"
        echo "SESSION_SECRET: [hidden]"
        echo ""
    else
        echo -e "${RED}Backend .env not found${NC}"
        echo ""
    fi
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            setup_frontend
            ;;
        2)
            setup_backend
            ;;
        3)
            setup_frontend
            setup_backend
            ;;
        4)
            view_frontend
            ;;
        5)
            view_backend
            ;;
        6)
            echo -e "${GREEN}Done!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            echo ""
            ;;
    esac
done
