#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo -e "${YELLOW}Project Management System - Run Script${NC}"
    echo ""
    echo "Usage: ./scripts/run.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  start         Start the development server (frontend + backend)"
    echo "  build         Build the application for production"
    echo "  test          Run unit tests"
    echo "  test:e2e      Run end-to-end tests"
    echo "  db:setup      Set up the database (run migrations)"
    echo "  db:seed       Seed the database with test data"
    echo "  lint          Run ESLint for code quality"
    echo "  format        Format code using Prettier"
    echo "  help          Show this help message"
}

# Function to start the development server
start_dev() {
    echo -e "${GREEN}Starting development servers...${NC}"
    
    # Start backend server in the background
    echo -e "${YELLOW}Starting backend server...${NC}"
    node server/index.js &
    BACKEND_PID=$!
    
    # Start frontend development server
    echo -e "${YELLOW}Starting frontend development server...${NC}"
    npm run dev
    
    # Kill backend server when frontend server stops
    kill $BACKEND_PID 2>/dev/null
}

# Function to build the application
build_app() {
    echo -e "${GREEN}Building application for production...${NC}"
    npm run build
}

# Function to run tests
run_tests() {
    echo -e "${GREEN}Running unit tests...${NC}"
    npm test
}

# Function to run e2e tests
run_e2e_tests() {
    echo -e "${GREEN}Running end-to-end tests...${NC}"
    npm run test:e2e
}

# Function to set up database
setup_database() {
    echo -e "${GREEN}Setting up database...${NC}"
    npm run db:migrate
}

# Function to seed database
seed_database() {
    echo -e "${GREEN}Seeding database...${NC}"
    npm run db:seed
}

# Function to run linter
run_lint() {
    echo -e "${GREEN}Running ESLint...${NC}"
    npm run lint
}

# Function to format code
format_code() {
    echo -e "${GREEN}Formatting code...${NC}"
    npm run format
}

# Main script logic
case "$1" in
    start)
        start_dev
        ;;
    build)
        build_app
        ;;
    test)
        run_tests
        ;;
    test:e2e)
        run_e2e_tests
        ;;
    db:setup)
        setup_database
        ;;
    db:seed)
        seed_database
        ;;
    lint)
        run_lint
        ;;
    format)
        format_code
        ;;
    help|*)
        show_help
        ;;
esac

exit 0
